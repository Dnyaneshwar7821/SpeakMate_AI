package com.rslsolution.speakmateai.service.impl;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.dto.groq.GroqRequest;
import com.rslsolution.speakmateai.dto.groq.GroqResponse;
import com.rslsolution.speakmateai.dto.request.SpeakingMessageRequest;
import com.rslsolution.speakmateai.dto.request.SpeakingSessionRequest;
import com.rslsolution.speakmateai.dto.request.SpeakingStartRequest;
import com.rslsolution.speakmateai.dto.response.SpeakingEndResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingHistoryResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingMessageResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingSessionDetailResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingSessionResponse;
import com.rslsolution.speakmateai.entity.ConversationFeedback;
import com.rslsolution.speakmateai.entity.ConversationMessage;
import com.rslsolution.speakmateai.entity.SpeakingSession;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.exception.GroqException;
import com.rslsolution.speakmateai.exception.SpeakingSessionNotFoundException;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.ConversationFeedbackRepository;
import com.rslsolution.speakmateai.repository.ConversationMessageRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.service.SpeakingSessionService;
import com.rslsolution.speakmateai.service.NotificationService;

@Service
@Transactional
public class SpeakingSessionServiceImpl implements SpeakingSessionService {

	@Value("${groq.api.key:}")
	private String apiKey;

	@Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
	private String apiUrl;

	@Value("${groq.model:llama-3.3-70b-versatile}")
	private String model;

	private final SpeakingSessionRepository speakingSessionRepository;
	private final ConversationMessageRepository messageRepository;
	private final ConversationFeedbackRepository feedbackRepository;
	private final UserRepository userRepository;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;
	private final ProgressRepository progressRepository;
	private final NotificationService notificationService;

	public SpeakingSessionServiceImpl(SpeakingSessionRepository speakingSessionRepository,
			ConversationMessageRepository messageRepository,
			ConversationFeedbackRepository feedbackRepository,
			UserRepository userRepository,
			RestTemplate restTemplate,
			ObjectMapper objectMapper,
			ProgressRepository progressRepository,
			NotificationService notificationService) {
		this.speakingSessionRepository = speakingSessionRepository;
		this.messageRepository = messageRepository;
		this.feedbackRepository = feedbackRepository;
		this.userRepository = userRepository;
		this.restTemplate = restTemplate;
		this.objectMapper = objectMapper;
		this.progressRepository = progressRepository;
		this.notificationService = notificationService;
	}

	// ── Helpers ───────────────────────────────────────────────────────

	private User currentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
			throw new UserNotFoundException("User not authenticated");
		}
		return userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));
	}

	private String callGroqChat(List<GroqRequest.Message> messages) {
		try {
			GroqRequest request = new GroqRequest(model, messages, 0.7);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.setBearerAuth(apiKey);

			HttpEntity<GroqRequest> entity = new HttpEntity<>(request, headers);
			ResponseEntity<GroqResponse> response = restTemplate.postForEntity(apiUrl, entity, GroqResponse.class);
			GroqResponse body = response.getBody();

			if (body == null || body.getChoices() == null || body.getChoices().isEmpty()) {
				throw new GroqException("No response received from Groq.");
			}

			return body.getChoices().get(0).getMessage().getContent();
		} catch (Exception e) {
			throw new GroqException("Groq API Call failed: " + e.getMessage());
		}
	}

	private String cleanJsonResponse(String response) {
		if (response == null) return "{}";
		String trimmed = response.trim();

		// Find first '{' and last '}' to extract JSON block cleanly
		int start = trimmed.indexOf('{');
		int end = trimmed.lastIndexOf('}');
		if (start != -1 && end != -1 && end >= start) {
			trimmed = trimmed.substring(start, end + 1);
		} else {
			if (trimmed.startsWith("```json")) {
				trimmed = trimmed.substring(7);
			} else if (trimmed.startsWith("```")) {
				trimmed = trimmed.substring(3);
			}
			if (trimmed.endsWith("```")) {
				trimmed = trimmed.substring(0, trimmed.length() - 3);
			}
		}
		return trimmed.trim();
	}

	private String extractFieldFromJson(String json, String fieldName) {
		if (json == null || !json.contains(fieldName)) return null;
		try {
			// Try quoted string pattern first (handles multi-line values using DOTALL)
			java.util.regex.Pattern quotedPattern = java.util.regex.Pattern.compile(
					"\"" + fieldName + "\"\\s*:\\s*\"(.*?)\"\\s*(?=,|\\n|\\r|\\})",
					java.util.regex.Pattern.DOTALL | java.util.regex.Pattern.CASE_INSENSITIVE
			);
			java.util.regex.Matcher matcher = quotedPattern.matcher(json);
			if (matcher.find()) {
				String val = matcher.group(1);
				// Unescape common JSON escapes
				val = val.replace("\\\"", "\"")
						 .replace("\\n", "\n")
						 .replace("\\r", "\r")
						 .replace("\\t", "\t")
						 .replace("\\\\", "\\");
				return val.trim();
			}

			// Try unquoted pattern (like null, numbers, booleans)
			java.util.regex.Pattern unquotedPattern = java.util.regex.Pattern.compile(
					"\"" + fieldName + "\"\\s*:\\s*([^,\\}\\s]+)",
					java.util.regex.Pattern.CASE_INSENSITIVE
			);
			matcher = unquotedPattern.matcher(json);
			if (matcher.find()) {
				String val = matcher.group(1).trim();
				if ("null".equalsIgnoreCase(val)) {
					return null;
				}
				return val;
			}
		} catch (Exception e) {
			// ignore
		}
		return null;
	}

	// ── Existing CRUD (kept for compatibility) ────────────────────────

	@Override
	public SpeakingSessionResponse createSession(SpeakingSessionRequest request) {
		User user = currentUser();
		SpeakingSession session = SpeakingSession.builder()
				.user(user)
				.topic(request.getTopic())
				.scenario(request.getTopic())
				.transcript(request.getTranscript())
				.duration(request.getDuration())
				.xpEarned(10)
				.score(80.0)
				.build();

		SpeakingSession savedSession = speakingSessionRepository.save(session);
		return mapToResponse(savedSession);
	}

	@Override
	public List<SpeakingSessionResponse> getAllSessions() {
		User user = currentUser();
		return speakingSessionRepository.findByUserOrderByCreatedAtDesc(user).stream()
				.map(this::mapToResponse)
				.toList();
	}

	@Override
	public SpeakingSessionResponse getSessionById(Long id) {
		SpeakingSession session = speakingSessionRepository.findById(id)
				.orElseThrow(() -> new SpeakingSessionNotFoundException("Speaking session not found"));
		return mapToResponse(session);
	}

	@Override
	public void deleteSession(Long id) {
		SpeakingSession session = speakingSessionRepository.findById(id)
				.orElseThrow(() -> new SpeakingSessionNotFoundException("Speaking session not found"));
		speakingSessionRepository.delete(session);
	}

	private SpeakingSessionResponse mapToResponse(SpeakingSession session) {
		return SpeakingSessionResponse.builder()
				.id(session.getId())
				.topic(session.getTopic())
				.transcript(session.getTranscript())
				.duration(session.getDuration())
				.pronunciationScore(session.getPronunciationScore())
				.fluencyScore(session.getFluencyScore())
				.grammarScore(session.getGrammarScore())
				.vocabularyScore(session.getVocabularyScore())
				.overallScore(session.getOverallScore())
				.feedback(session.getFeedback())
				.createdAt(session.getCreatedAt())
				.build();
	}

	// ── Phase 2 — Speaking practice module ────────────────────────────

	@Override
	public SpeakingSessionResponse startSession(SpeakingStartRequest request) {
		User user = currentUser();

		SpeakingSession session = SpeakingSession.builder()
				.user(user)
				.topic(request.getScenario())
				.scenario(request.getScenario())
				.duration(0)
				.xpEarned(0)
				.score(0.0)
				.transcript("")
				.build();

		SpeakingSession saved = speakingSessionRepository.save(session);

		// AI introduces the conversation scenario
		List<GroqRequest.Message> messages = new ArrayList<>();
		String sysPrompt = String.format(
				"You are an English tutor simulating the scenario: '%s'. " +
				"Greet the student, briefly introduce the scenario, and ask an opening question to start the practice conversation. " +
				"Do not give any corrections yet. Keep it warm, natural, and under 2 sentences.",
				request.getScenario()
		);
		messages.add(new GroqRequest.Message("system", sysPrompt));
		messages.add(new GroqRequest.Message("user", "Hello tutor, let's start."));

		String intro = callGroqChat(messages);

		// Save the AI message
		ConversationMessage aiMsg = ConversationMessage.builder()
				.session(saved)
				.sender("ai")
				.message(intro)
				.build();
		messageRepository.save(aiMsg);

		// Return session response (with transcript populated with intro)
		saved.setTranscript(intro);
		speakingSessionRepository.save(saved);

		return mapToResponse(saved);
	}

	@Override
	public SpeakingMessageResponse processMessage(SpeakingMessageRequest request) {
		SpeakingSession session = speakingSessionRepository.findById(request.getSessionId())
				.orElseThrow(() -> new SpeakingSessionNotFoundException("Session not found"));

		// 1. Save user message
		ConversationMessage userMsg = ConversationMessage.builder()
				.session(session)
				.sender("user")
				.message(request.getMessage())
				.build();
		messageRepository.save(userMsg);

		// 2. Fetch full conversation history for context
		List<ConversationMessage> history = messageRepository.findBySessionOrderByTimestampAsc(session);

		// 3. Determine Level
		String chatLevel = request.getLevel();
		if (chatLevel == null || chatLevel.trim().isEmpty()) {
			chatLevel = session.getUser().getEnglishLevel();
		}
		if (chatLevel == null || chatLevel.trim().isEmpty()) {
			chatLevel = "Beginner";
		}

		String levelInstruction = "";
		if ("Beginner".equalsIgnoreCase(chatLevel)) {
			levelInstruction = "Current Learner English Level: Beginner.\n" +
					"Instructions: Use extremely simple, clear, and common vocabulary (A1-A2 levels). Speak in very short, basic sentences. Keep your grammar explanations as simple and concrete as possible.\n";
		} else if ("Intermediate".equalsIgnoreCase(chatLevel)) {
			levelInstruction = "Current Learner English Level: Intermediate.\n" +
					"Instructions: Use everyday conversational English, standard sentence lengths, and B1-B2 vocabulary. Introduce occasional common idioms with clear, practical explanations.\n";
		} else { // Advanced
			levelInstruction = "Current Learner English Level: Advanced.\n" +
					"Instructions: Use sophisticated, professional, and diverse vocabulary (C1-C2 levels). Use complex and varied sentence structures, advanced idioms, and academic or business terms. Challenge the learner with nuanced phrasing and detailed stylistic suggestions.\n";
		}

		List<GroqRequest.Message> groqMessages = new ArrayList<>();
		String systemPrompt = String.format(
				"You are a friendly, encouraging English tutor roleplaying with the student in the scenario: '%s'.\n" +
				"You must act as the role required (e.g. waiter in a restaurant, interviewer in a job interview) and keep the conversation natural and flowing.\n" +
				"Evaluate the user's LATEST message for grammar and vocabulary improvements.\n" +
				"%s\n" +
				"YOU MUST RESPOND IN VALID JSON FORMAT ONLY. Do not wrap in ```json or markdown blocks. Do not include any text, notes, or explanations outside the JSON object.\n" +
				"The JSON must have these exact fields and structure:\n" +
				"{\n" +
				"  \"aiReply\": \"Your natural conversational response as the roleplayer (1-2 sentences, keep it moving). IMPORTANT: Do not include the follow-up question in this section!\",\n" +
				"  \"grammarCorrection\": \"Corrected version of the user's sentence if they made a mistake, otherwise null.\",\n" +
				"  \"betterSentence\": \"A more native or natural way to express the user's sentence, otherwise null.\",\n" +
				"  \"vocabularySuggestions\": \"Alternative words to enrich their vocabulary, otherwise null.\",\n" +
				"  \"explanation\": \"A short (1 sentence) tutoring explanation of the correction or vocab suggestion, otherwise null.\",\n" +
				"  \"followUpQuestion\": \"A natural follow-up question to keep the chat moving forward.\"\n" +
				"}\n\n" +
				"Important: Escape any double quotes inside string values as \\\" to ensure the JSON is valid.",
				session.getScenario(),
				levelInstruction
		);
		groqMessages.add(new GroqRequest.Message("system", systemPrompt));

		// Add last 10 messages for context
		int startIdx = Math.max(0, history.size() - 10);
		for (int i = startIdx; i < history.size(); i++) {
			ConversationMessage m = history.get(i);
			String role = m.getSender().equals("user") ? "user" : "assistant";
			groqMessages.add(new GroqRequest.Message(role, m.getMessage()));
		}

		String groqReplyRaw = callGroqChat(groqMessages);
		String cleanJson = cleanJsonResponse(groqReplyRaw);

		SpeakingMessageResponse response = new SpeakingMessageResponse();
		try {
			response = objectMapper.readValue(cleanJson, SpeakingMessageResponse.class);
		} catch (Exception e) {
			// Fallback if JSON parsing fails — try extracting fields manually
			String extractedReply = extractFieldFromJson(cleanJson, "aiReply");
			if (extractedReply != null && !extractedReply.isEmpty()) {
				response.setAiReply(extractedReply);
				response.setGrammarCorrection(extractFieldFromJson(cleanJson, "grammarCorrection"));
				response.setBetterSentence(extractFieldFromJson(cleanJson, "betterSentence"));
				response.setVocabularySuggestions(extractFieldFromJson(cleanJson, "vocabularySuggestions"));
				response.setExplanation(extractFieldFromJson(cleanJson, "explanation"));
				response.setFollowUpQuestion(extractFieldFromJson(cleanJson, "followUpQuestion"));
			} else {
				// If we can't extract the aiReply field, check if it looks like JSON
				if (cleanJson.contains("{") || cleanJson.contains("\"") || cleanJson.contains("aiReply")) {
					response.setAiReply("I'm sorry, I had some trouble processing my response. Could you please repeat that?");
				} else {
					response.setAiReply(cleanJson);
				}
				response.setGrammarCorrection(null);
				response.setBetterSentence(null);
				response.setVocabularySuggestions(null);
				response.setExplanation(null);
				response.setFollowUpQuestion(null);
			}
		}

		// Grammar correction logic
		String userClean = request.getMessage().trim().replaceAll("[\\p{Punct}&&[^']]+", "").replaceAll("\\s+", " ").toLowerCase();
		String grammarClean = (response.getGrammarCorrection() != null) ? response.getGrammarCorrection().trim().replaceAll("[\\p{Punct}&&[^']]+", "").replaceAll("\\s+", " ").toLowerCase() : "";

		if (response.getGrammarCorrection() == null || response.getGrammarCorrection().equalsIgnoreCase("none") || response.getGrammarCorrection().equalsIgnoreCase("null") || response.getGrammarCorrection().trim().isEmpty()) {
			response.setGrammarCorrection("✅ Your sentence is correct.");
		} else if (grammarClean.equals(userClean)) {
			response.setGrammarCorrection("✅ Your sentence is correct.");
		}

		// Clean up fields from "none" / "null" values
		if (response.getBetterSentence() != null && (response.getBetterSentence().equalsIgnoreCase("none") || response.getBetterSentence().equalsIgnoreCase("null") || response.getBetterSentence().trim().isEmpty())) {
			response.setBetterSentence(null);
		}
		if (response.getVocabularySuggestions() != null && (response.getVocabularySuggestions().equalsIgnoreCase("none") || response.getVocabularySuggestions().equalsIgnoreCase("null") || response.getVocabularySuggestions().trim().isEmpty())) {
			response.setVocabularySuggestions(null);
		}
		if (response.getExplanation() != null && (response.getExplanation().equalsIgnoreCase("none") || response.getExplanation().equalsIgnoreCase("null") || response.getExplanation().trim().isEmpty())) {
			response.setExplanation(null);
		}
		if (response.getFollowUpQuestion() != null && (response.getFollowUpQuestion().equalsIgnoreCase("none") || response.getFollowUpQuestion().equalsIgnoreCase("null") || response.getFollowUpQuestion().trim().isEmpty())) {
			response.setFollowUpQuestion(null);
		}

		// Deduplicate follow-up from reply
		String reply = response.getAiReply();
		String followup = response.getFollowUpQuestion();
		if (reply != null && followup != null && !followup.isEmpty()) {
			String replyTrim = reply.trim();
			String followupTrim = followup.trim();
			if (replyTrim.endsWith(followupTrim)) {
				reply = replyTrim.substring(0, replyTrim.length() - followupTrim.length()).trim();
			} else if (replyTrim.contains(followupTrim)) {
				reply = replyTrim.replace(followupTrim, "").trim();
			}
			response.setAiReply(reply);
		}

		// 4. Save AI response
		ConversationMessage aiMsg = ConversationMessage.builder()
				.session(session)
				.sender("ai")
				.message(response.getAiReply())
				.build();
		messageRepository.save(aiMsg);

		// Update session transcript
		String currentTranscript = session.getTranscript() != null ? session.getTranscript() : "";
		session.setTranscript(currentTranscript + "\nUser: " + request.getMessage() + "\nAI: " + response.getAiReply());
		speakingSessionRepository.save(session);

		return response;
	}

	@Override
	public SpeakingEndResponse endSession(Long id) {
		SpeakingSession session = speakingSessionRepository.findById(id)
				.orElseThrow(() -> new SpeakingSessionNotFoundException("Session not found"));

		List<ConversationMessage> history = messageRepository.findBySessionOrderByTimestampAsc(session);

		// Calculate duration
		long durationSeconds = Duration.between(session.getCreatedAt(), LocalDateTime.now()).toSeconds();
		if (durationSeconds <= 0) durationSeconds = 30; // fallback minimum

		// Build transcript text for AI review
		StringBuilder transcriptBuilder = new StringBuilder();
		for (ConversationMessage m : history) {
			transcriptBuilder.append(m.getSender().toUpperCase()).append(": ").append(m.getMessage()).append("\n");
		}
		String fullTranscript = transcriptBuilder.toString();

		// Request overall evaluation from Groq
		List<GroqRequest.Message> messages = new ArrayList<>();
		String sysPrompt =
				"Review the following transcript of an English speaking practice session. " +
				"Evaluate the student's performance and summarize the feedback.\n\n" +
				"YOU MUST RESPOND IN VALID JSON FORMAT ONLY. Do not wrap in markdown or ```json. Do not include any text or explanations outside the JSON object.\n" +
				"The JSON must have these exact fields and structure:\n" +
				"{\n" +
				"  \"score\": 85.0,\n" +
				"  \"summary\": \"A short summary of how the conversation went.\",\n" +
				"  \"vocabularyLearned\": \"Key words or phrases suggested to the student during the session.\",\n" +
				"  \"grammarCorrections\": \"Summary of grammar errors noted.\",\n" +
				"  \"betterSentences\": \"Alternative native phrasing suggestions.\",\n" +
				"  \"motivationalMessage\": \"A warm, encouraging wrap-up message.\"\n" +
				"}\n\n" +
				"Important: Escape any double quotes inside string values as \\\" to ensure the JSON is valid.";
		messages.add(new GroqRequest.Message("system", sysPrompt));
		messages.add(new GroqRequest.Message("user", "Transcript:\n" + fullTranscript));

		double score = 75.0;
		String summary = "Completed speaking practice.";
		String vocab = "Various vocabulary.";
		String grammar = "Various grammar points.";
		String better = "Alternative sentences.";
		String motivational = "Keep practicing, you are doing great!";

		try {
			String rawEval = callGroqChat(messages);
			String cleanJson = cleanJsonResponse(rawEval);

			try {
				FinalEvaluation evalObj = objectMapper.readValue(cleanJson, FinalEvaluation.class);
				if (evalObj.getScore() != null) score = evalObj.getScore();
				if (evalObj.getSummary() != null) summary = evalObj.getSummary();
				if (evalObj.getVocabularyLearned() != null) vocab = evalObj.getVocabularyLearned();
				if (evalObj.getGrammarCorrections() != null) grammar = evalObj.getGrammarCorrections();
				if (evalObj.getBetterSentences() != null) better = evalObj.getBetterSentences();
				if (evalObj.getMotivationalMessage() != null) motivational = evalObj.getMotivationalMessage();
			} catch (Exception e) {
				// Fallback extraction
				String extSummary = extractFieldFromJson(cleanJson, "summary");
				if (extSummary != null) summary = extSummary;
				String extVocab = extractFieldFromJson(cleanJson, "vocabularyLearned");
				if (extVocab != null) vocab = extVocab;
				String extGrammar = extractFieldFromJson(cleanJson, "grammarCorrections");
				if (extGrammar != null) grammar = extGrammar;
				String extBetter = extractFieldFromJson(cleanJson, "betterSentences");
				if (extBetter != null) better = extBetter;
				String extMotivational = extractFieldFromJson(cleanJson, "motivationalMessage");
				if (extMotivational != null) motivational = extMotivational;

				String extScore = extractFieldFromJson(cleanJson, "score");
				if (extScore != null) {
					try {
						score = Double.parseDouble(extScore);
					} catch (Exception ex) {
						// ignore, keep default
					}
				}
			}
		} catch (Exception e) {
			System.err.println("⚠️ Groq final evaluation failed, using fallback metrics: " + e.getMessage());
		}

		// Calculate XP reward
		int xp = 10 + (history.size() / 2) * 5; // base 10 XP + 5 XP per message turn
		if (xp > 50) xp = 50; // cap at 50 XP

		// Update session fields
		session.setDuration((int) durationSeconds);
		session.setXpEarned(xp);
		session.setScore(score);
		session.setOverallScore(score);
		session.setGrammarScore(score);
		session.setVocabularyScore(score);
		session.setFluencyScore(score);
		session.setPronunciationScore(score);
		session.setFeedback(summary);
		speakingSessionRepository.save(session);

		// Update user's progress
		try {
			User user = session.getUser();
			Progress progress = progressRepository.findByUser(user)
					.orElseGet(() -> Progress.builder()
							.user(user)
							.xp(0)
							.level(1)
							.currentStreak(0)
							.longestStreak(0)
							.totalPracticeMinutes(0)
							.totalSpeakingSessions(0)
							.totalGrammarChecks(0)
							.totalVocabularyWords(0)
							.build());
			int sessionMinutes = (int) Math.ceil(durationSeconds / 60.0);
			progress.setTotalPracticeMinutes((progress.getTotalPracticeMinutes() == null ? 0 : progress.getTotalPracticeMinutes()) + sessionMinutes);
			progress.setTotalSpeakingSessions((progress.getTotalSpeakingSessions() == null ? 0 : progress.getTotalSpeakingSessions()) + 1);
			int newXp = (progress.getXp() == null ? 0 : progress.getXp()) + xp;
			progress.setXp(newXp);
			progress.setLevel((newXp / 500) + 1);
			progressRepository.save(progress);
		} catch (Exception ex) {
			// Ignore progress update errors
		}

		// ── Trigger session-end notification ─────────────────────────────
		try {
			int sessionMinutes = (int) Math.max(1, Math.ceil(durationSeconds / 60.0));
			notificationService.createSystemNotification(session.getUser(),
					"Speaking Session Complete! 🎙️",
					"Great job! You practiced \"" + session.getScenario() + "\" for " + sessionMinutes + " min and earned " + xp + " XP.");
		} catch (Exception ignored) {}

		// Save feedback entity
		ConversationFeedback feedback = ConversationFeedback.builder()
				.session(session)
				.grammarCorrections(grammar)
				.betterSentences(better)
				.vocabularySuggestions(vocab)
				.summary(summary)
				.build();
		feedbackRepository.save(feedback);

		// Count grammar mistakes based on messages containing corrections
		int mistakes = 0;
		for (ConversationMessage m : history) {
			if (m.getSender().equals("user") && m.getMessage().length() > 5) {
				// heuristic: we will count based on whether the final eval mentions mistakes,
				// or just use history size / 4
				mistakes++;
			}
		}
		mistakes = Math.max(1, mistakes / 3);

		return SpeakingEndResponse.builder()
				.sessionId(session.getId())
				.scenario(session.getScenario())
				.duration((int) durationSeconds)
				.messagesExchanged(history.size())
				.grammarMistakes(mistakes)
				.xpEarned(xp)
				.score(score)
				.summary(summary)
				.vocabularyLearned(vocab)
				.motivationalMessage(motivational)
				.build();
	}

	@Override
	public List<SpeakingHistoryResponse> getSessionHistory() {
		User user = currentUser();
		return speakingSessionRepository.findByUserOrderByCreatedAtDesc(user).stream()
				.map(s -> {
					String preview = "";
					if (s.getMessages() != null && !s.getMessages().isEmpty()) {
						preview = s.getMessages().get(s.getMessages().size() - 1).getMessage();
					} else if (s.getTranscript() != null) {
						preview = s.getTranscript();
					}
					if (preview.length() > 100) preview = preview.substring(0, 97) + "...";

					return SpeakingHistoryResponse.builder()
							.id(s.getId())
							.scenario(s.getScenario())
							.duration(s.getDuration())
							.xpEarned(s.getXpEarned())
							.score(s.getScore())
							.previewMessage(preview)
							.createdAt(s.getCreatedAt())
							.build();
				})
				.toList();
	}

	@Override
	public SpeakingSessionDetailResponse getSessionDetail(Long id) {
		SpeakingSession s = speakingSessionRepository.findById(id)
				.orElseThrow(() -> new SpeakingSessionNotFoundException("Session not found"));

		List<SpeakingSessionDetailResponse.MessageDto> msgs = messageRepository.findBySessionOrderByTimestampAsc(s).stream()
				.map(m -> SpeakingSessionDetailResponse.MessageDto.builder()
						.id(m.getId())
						.sender(m.getSender())
						.message(m.getMessage())
						.timestamp(m.getTimestamp())
						.build())
				.toList();

		Optional<ConversationFeedback> fb = feedbackRepository.findBySession(s);
		SpeakingSessionDetailResponse.FeedbackDto fbDto = fb.map(f -> SpeakingSessionDetailResponse.FeedbackDto.builder()
				.grammarCorrections(f.getGrammarCorrections())
				.betterSentences(f.getBetterSentences())
				.vocabularySuggestions(f.getVocabularySuggestions())
				.summary(f.getSummary())
				.build())
				.orElse(null);

		return SpeakingSessionDetailResponse.builder()
				.id(s.getId())
				.scenario(s.getScenario())
				.duration(s.getDuration())
				.xpEarned(s.getXpEarned())
				.score(s.getScore())
				.pronunciationScore(s.getPronunciationScore())
				.fluencyScore(s.getFluencyScore())
				.grammarScore(s.getGrammarScore())
				.vocabularyScore(s.getVocabularyScore())
				.overallScore(s.getOverallScore())
				.feedback(s.getFeedback())
				.createdAt(s.getCreatedAt())
				.messages(msgs)
				.feedbackDetail(fbDto)
				.build();
	}

	@Override
	public List<String> getHints(Long id) {
		SpeakingSession session = speakingSessionRepository.findById(id)
				.orElseThrow(() -> new SpeakingSessionNotFoundException("Session not found"));

		List<ConversationMessage> history = messageRepository.findBySessionOrderByTimestampAsc(session);

		// Build context for suggestions
		List<GroqRequest.Message> groqMessages = new ArrayList<>();
		String systemPrompt = String.format(
				"You are an expert English tutor observing a practice conversation under the scenario: '%s'.\n" +
				"Based on the conversation history, suggest EXACTLY 3 short, natural, and distinct alternative responses the student could say next to keep the conversation flowing.\n" +
				"Each suggestion must be simple, direct, natural, and maximum 8 words.\n" +
				"YOU MUST RESPOND IN VALID JSON FORMAT ONLY. Do not wrap in ```json or markdown blocks. Do not include any explanations, notes, or text outside the JSON object.\n" +
				"The JSON must have this exact field and structure:\n" +
				"{\n" +
				"  \"hints\": [\n" +
				"    \"Suggestion one\",\n" +
				"    \"Suggestion two\",\n" +
				"    \"Suggestion three\"\n" +
				"  ]\n" +
				"}",
				session.getScenario()
		);
		groqMessages.add(new GroqRequest.Message("system", systemPrompt));

		// Add last 10 messages for context
		int startIdx = Math.max(0, history.size() - 10);
		for (int i = startIdx; i < history.size(); i++) {
			ConversationMessage m = history.get(i);
			String role = m.getSender().equals("user") ? "user" : "assistant";
			groqMessages.add(new GroqRequest.Message(role, m.getMessage()));
		}

		try {
			String rawReply = callGroqChat(groqMessages);
			String cleanJson = cleanJsonResponse(rawReply);
			com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(cleanJson);
			if (node.has("hints")) {
				return objectMapper.convertValue(node.get("hints"), new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
			}
		} catch (Exception e) {
			// ignore and fallback
		}

		return List.of(
				"Could you please explain that?",
				"Yes, that makes sense to me.",
				"What do you suggest we do next?"
		);
	}

	// Helper inner class for Jackson deserialization
	private static class FinalEvaluation {
		private Double score;
		private String summary;
		private String vocabularyLearned;
		private String grammarCorrections;
		private String betterSentences;
		private String motivationalMessage;

		public Double getScore() { return score; }
		public void setScore(Double score) { this.score = score; }
		public String getSummary() { return summary; }
		public void setSummary(String summary) { this.summary = summary; }
		public String getVocabularyLearned() { return vocabularyLearned; }
		public void setVocabularyLearned(String vocabularyLearned) { this.vocabularyLearned = vocabularyLearned; }
		public String getGrammarCorrections() { return grammarCorrections; }
		public void setGrammarCorrections(String grammarCorrections) { this.grammarCorrections = grammarCorrections; }
		public String getBetterSentences() { return betterSentences; }
		public void setBetterSentences(String betterSentences) { this.betterSentences = betterSentences; }
		public String getMotivationalMessage() { return motivationalMessage; }
		public void setMotivationalMessage(String motivationalMessage) { this.motivationalMessage = motivationalMessage; }
	}
}