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
import com.rslsolution.speakmateai.enums.Role;
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

	@Value("${groq.model.chat:${groq.model:llama-3.1-8b-instant}}")
	private String model;

	private final SpeakingSessionRepository speakingSessionRepository;
	private final ConversationMessageRepository messageRepository;
	private final ConversationFeedbackRepository feedbackRepository;
	private final UserRepository userRepository;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;
	private final ProgressRepository progressRepository;
	private final NotificationService notificationService;
	private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

	public SpeakingSessionServiceImpl(SpeakingSessionRepository speakingSessionRepository,
			ConversationMessageRepository messageRepository,
			ConversationFeedbackRepository feedbackRepository,
			UserRepository userRepository,
			RestTemplate restTemplate,
			ObjectMapper objectMapper,
			ProgressRepository progressRepository,
			NotificationService notificationService,
			org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		this.speakingSessionRepository = speakingSessionRepository;
		this.messageRepository = messageRepository;
		this.feedbackRepository = feedbackRepository;
		this.userRepository = userRepository;
		this.restTemplate = restTemplate;
		this.objectMapper = objectMapper;
		this.progressRepository = progressRepository;
		this.notificationService = notificationService;
		this.jdbcTemplate = jdbcTemplate;
	}

	private SpeakingSession safeSaveSession(SpeakingSession session) {
		try {
			return speakingSessionRepository.save(session);
		} catch (Exception e) {
			// If legacy foreign key constraint pointing to students table is encountered, drop it dynamically and retry
			try {
				if (jdbcTemplate != null) {
					jdbcTemplate.execute("ALTER TABLE IF EXISTS speaking_sessions DROP CONSTRAINT IF EXISTS fkbtsorovntca8vl5eslvcwfwf3 CASCADE");
				}
			} catch (Exception ignored) {}
			return speakingSessionRepository.save(session);
		}
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

	private static final List<String> FALLBACK_MODELS = List.of(
			"openai/gpt-oss-120b",
			"qwen/qwen3.6-27b",
			"openai/gpt-oss-20b"
	);

	private String callGroqChat(List<GroqRequest.Message> messages) {
		List<String> modelsToTry = new ArrayList<>();
		if (model != null && !model.trim().isEmpty()) {
			modelsToTry.add(model.trim());
		}
		for (String fb : FALLBACK_MODELS) {
			if (!modelsToTry.contains(fb)) {
				modelsToTry.add(fb);
			}
		}

		Exception lastException = null;
		for (String targetModel : modelsToTry) {
			try {
				GroqRequest request = new GroqRequest(targetModel, messages, 0.7);

				HttpHeaders headers = new HttpHeaders();
				headers.setContentType(MediaType.APPLICATION_JSON);
				headers.setBearerAuth(apiKey);

				HttpEntity<GroqRequest> entity = new HttpEntity<>(request, headers);
				ResponseEntity<GroqResponse> response = restTemplate.postForEntity(apiUrl, entity, GroqResponse.class);
				GroqResponse body = response.getBody();

				if (body != null && body.getChoices() != null && !body.getChoices().isEmpty()) {
					return body.getChoices().get(0).getMessage().getContent();
				}
			} catch (Exception e) {
				lastException = e;
				// If 429 rate limit or error, automatically try the next model in the cascade!
			}
		}
		throw new GroqException("Groq API Call failed on all models: " + (lastException != null ? lastException.getMessage() : "Unknown"));
	}

	private String stripReasoning(String text) {
		if (text == null) return "";
		String clean = text.replaceAll("(?s)<think>.*?</think>", "").trim();
		if (clean.contains("Analyze User Input:") || clean.contains("Identify Key Constraints:") || clean.contains("Context:") || clean.contains("**Analyze")) {
			int idx = clean.lastIndexOf("\n\n");
			if (idx != -1 && idx < clean.length() - 1) {
				String candidate = clean.substring(idx).trim();
				if (!candidate.contains("Analyze") && !candidate.contains("Context:") && !candidate.contains("**")) {
					return candidate;
				}
			}
			return null;
		}
		return clean;
	}

	private String cleanJsonResponse(String response) {
		if (response == null) return "{}";
		String trimmed = response.replaceAll("(?s)<think>.*?</think>", "").trim();

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

		SpeakingSession savedSession = safeSaveSession(session);
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

	private String getDefaultScenarioOpening(String scenario) {
		if (scenario == null) return "Hello! Welcome to our speaking practice session. How are you doing today?";
		String s = scenario.toLowerCase();

		// Kids
		if (s.contains("show & tell") || s.contains("superhero") || s.contains("toy")) {
			return "Hi there! I am so excited for Show and Tell today! What awesome toy, superhero, or story do you want to share with me?";
		} else if (s.contains("zoo") || s.contains("animal")) {
			return "Hello! Welcome to the city zoo! We have roaring lions, playful monkeys, and huge elephants. What animal do you want to visit first?";
		} else if (s.contains("ice cream")) {
			return "Hi! Welcome to the ice cream parlor! We have delicious chocolate, creamy vanilla, and fresh strawberry. What flavor would you like?";
		} else if (s.contains("school lunch") || s.contains("canteen")) {
			return "Hey! Welcome to lunchtime. I have a tasty sandwich and fruit juice today. What did you bring for lunch?";
		} else if (s.contains("space adventure") || s.contains("space rocket")) {
			return "Greetings, astronaut! We are about to launch our rocket into outer space. Are you ready for countdown in 3, 2, 1?";
		} else if (s.contains("park") || s.contains("playground") || s.contains("swings")) {
			return "Hello friend! The weather is so nice at the park. Do you want to play on the swings or kick the football first?";
		} else if (s.contains("birthday party")) {
			return "Happy Birthday! Welcome to the celebration! Would you like some cake, or should we play party games first?";
		} else if (s.contains("doctor") || s.contains("pharmacy") || s.contains("health")) {
			return "Hello! Come on in and have a seat. How are you feeling today, and how can I help you feel better?";
		} else if (s.contains("bedtime story")) {
			return "Good evening! Let's create a wonderful bedtime adventure story together. Once upon a time, where should our journey begin?";
		}

		// School Standards (1st to 10th Std)
		else if (s.contains("alphabet") || s.contains("phonics") || s.contains("sounds fun")) {
			return "Hello young learner! Welcome to fun with letters and sounds. Which letter of the alphabet is your favorite?";
		} else if (s.contains("colors & drawing")) {
			return "Hello artist! I love drawing and painting. What bright colors do you like to color your pictures with?";
		} else if (s.contains("school greetings") || s.contains("morning routine")) {
			return "Good morning! It is wonderful to see you today. How did you start your morning routine before coming to school?";
		} else if (s.contains("classroom objects") || s.contains("stationery")) {
			return "Good day! Welcome to our classroom. Could you tell me what stationery items you have in your school bag today?";
		} else if (s.contains("science project") || s.contains("robotics")) {
			return "Welcome to the science and innovation lab! What exciting project or model are you preparing to demonstrate?";
		} else if (s.contains("water conservation") || s.contains("environmental care") || s.contains("climate")) {
			return "Hello! Thank you for joining our environmental session. In your opinion, what is the best way we can save water and protect nature?";
		} else if (s.contains("debate")) {
			return "Welcome to today's formal debate session. The floor is yours—please present your opening statement on the topic.";
		} else if (s.contains("student council") || s.contains("leadership")) {
			return "Welcome candidate! Thank you for stepping up for student council leadership. What positive changes do you plan to bring to our school?";
		} else if (s.contains("board oral exam") || s.contains("oratory mastery") || s.contains("keynote")) {
			return "Welcome to the formal oral examination. Please begin by introducing yourself and stating your primary speaking topic.";
		}

		// Teens & Young Adults
		else if (s.contains("high school") || s.contains("first day")) {
			return "Hey! Welcome to the new school term. I'm excited to be your classmate! How has your first day been going so far?";
		} else if (s.contains("fast food") || s.contains("burger")) {
			return "Hey! Welcome to Burger Express. Are you ready to order, or would you like to check out our combo meals today?";
		} else if (s.contains("gaming") || s.contains("hobbies")) {
			return "Hey there! It's great to connect. What video games, music, or hobbies have you been enjoying recently?";
		} else if (s.contains("homework help")) {
			return "Hi! Don't worry, we can work through this assignment together. Which question or topic is giving you trouble?";
		} else if (s.contains("coffee") || s.contains("cafe")) {
			return "Hi there! Welcome to the cafe. What specialty coffee or tea can I brew for you today?";
		} else if (s.contains("hotel") || s.contains("check-in")) {
			return "Good day and welcome to our hotel! Are you checking in under a reservation today?";
		} else if (s.contains("airport") || s.contains("customs") || s.contains("backpacking") || s.contains("travel")) {
			return "Good day! Welcome to airport check-in. May I see your passport and travel documents, please?";
		} else if (s.contains("job interview") || s.contains("admission interview") || s.contains("part-time job") || s.contains("interview")) {
			return "Welcome and thank you for meeting with us today! To begin, could you please introduce yourself and tell us what interests you about this role?";
		} else if (s.contains("roommate") || s.contains("hostel") || s.contains("apartment")) {
			return "Hi there! It's great to meet you. Shall we discuss our room layout, shared chores, and daily schedules?";
		} else if (s.contains("restaurant") || s.contains("dining") || s.contains("food")) {
			return "Hello! Welcome to our restaurant. Can I get a table ready for you, or would you like to see our dinner menu?";
		} else if (s.contains("shopping") || s.contains("clothes") || s.contains("store")) {
			return "Hi! Welcome to our store. Are you looking for a specific size, color, or style today?";
		}

		// Professionals & Seniors
		else if (s.contains("office small talk") || s.contains("business meeting") || s.contains("meeting") || s.contains("business")) {
			return "Good morning! Thank you for joining our session today. Shall we review the key project milestones and agenda items?";
		} else if (s.contains("salary") || s.contains("contract negotiation")) {
			return "Good afternoon. Thank you for taking the time to discuss the offer. What aspects of the compensation package would you like to review?";
		} else if (s.contains("presentation skills") || s.contains("presentation")) {
			return "Welcome! The stage is set for your presentation. Whenever you're ready, please deliver your opening hook and slide overview.";
		} else if (s.contains("tea time") || s.contains("gardening")) {
			return "Good afternoon! A warm cup of tea is ready. How are your garden plants and home projects doing these days?";
		} else if (s.contains("museum tour") || s.contains("life stories")) {
			return "Welcome to the guided cultural tour! We have fascinating historical exhibits ahead. What period of history interests you most?";
		} else if (s.contains("customer support")) {
			return "Hello! Thank you for calling customer support. My name is Alex. How may I assist you with your account today?";
		} else if (s.contains("daily conversation") || s.contains("relaxed daily")) {
			return "Hello! Welcome to our daily conversation practice. How has your day been going so far?";
		}

		String cleanScenario = (scenario != null ? scenario : "").replaceAll("(?i)\\b(conversation|practice|session)\\b", "").trim();
		String prefix = cleanScenario.isEmpty() ? "" : cleanScenario + " ";
		return "Hello! Welcome to our " + prefix + "conversation practice. What would you like to start with?";
	}

	@Override
	public SpeakingSessionResponse startSession(SpeakingStartRequest request) {
		User user = currentUser();

		String scenarioName = (request != null && request.getScenario() != null && !request.getScenario().trim().isEmpty())
				? request.getScenario().trim()
				: "Daily Conversation";

		SpeakingSession session = SpeakingSession.builder()
				.user(user)
				.topic(scenarioName)
				.scenario(scenarioName)
				.duration(0)
				.xpEarned(0)
				.score(0.0)
				.transcript("")
				.build();

		SpeakingSession saved = safeSaveSession(session);

		// AI introduces the conversation scenario
		String intro;
		try {
			List<GroqRequest.Message> messages = new ArrayList<>();
			String sysPrompt = String.format(
					"You are an English tutor roleplaying the opening of the scenario: '%s'.\n" +
					"Immediately greet the student in-character (e.g. as a friendly waiter, interviewer, hotel clerk, or conversation partner).\n" +
					"Ask an engaging opening question to start the dialogue.\n" +
					"Keep it warm, natural, and under 2 sentences. Never output JSON, chain of thought, or formatting tags.",
					scenarioName
			);
			messages.add(new GroqRequest.Message("system", sysPrompt));
			messages.add(new GroqRequest.Message("user", "Hello! Let's start the conversation."));

			String rawIntro = callGroqChat(messages);
			intro = stripReasoning(rawIntro);
			if (intro == null || intro.trim().isEmpty() || intro.contains("{") || intro.contains("Analyze")) {
				intro = getDefaultScenarioOpening(scenarioName);
			}
		} catch (Exception e) {
			intro = getDefaultScenarioOpening(scenarioName);
		}

		// Save the AI message
		ConversationMessage aiMsg = ConversationMessage.builder()
				.session(saved)
				.sender("ai")
				.message(intro)
				.build();
		messageRepository.save(aiMsg);

		// Return session response (with transcript populated with intro)
		saved.setTranscript(intro);
		saved = safeSaveSession(saved);

		return mapToResponse(saved);
	}

	private String sanitizeSpokenText(String text) {
		if (text == null) return null;
		String clean = text.trim();
		// 1. Remove all bracket tags like [article], [GRAMMAR], [BETTER_SENTENCE], etc.
		clean = clean.replaceAll("\\[.*?\\]", "");
		// 2. Remove literal "dot dot dot", ellipses "...", "…"
		clean = clean.replaceAll("(?i)\\bdot\\s*dot\\s*dot\\b", "");
		clean = clean.replaceAll("\\.{2,}", "");
		clean = clean.replaceAll("…", "");
		// 3. Remove markdown markers like ** or * or _
		clean = clean.replaceAll("[*#_~`]", "");
		// 4. Remove stage directions like (smiling), (laughs), (excited)
		clean = clean.replaceAll("\\([^)]*\\)", "");
		// 5. Clean excess whitespace
		clean = clean.replaceAll("\\s+", " ").trim();
		return clean.isEmpty() ? null : clean;
	}

	private String cleanAndSanitizeHint(String raw) {
		if (raw == null) return null;
		String text = sanitizeSpokenText(raw);
		if (text == null) return null;
		// Strip prefixes like "Suggestion 1:", "Option 1 -", "1. ", "Hint 1:"
		text = text.replaceAll("(?i)^(suggestion|option|hint|response|choice)\\s*\\d*\\s*[:\\-.]?\\s*", "");
		text = text.replaceAll("^\\d+[\\.\\)]\\s*", "");
		text = text.replaceAll("^[\"']+|[\"']+$", "").trim();
		if (text.isEmpty()) return null;

		String lower = text.toLowerCase();
		if (lower.equals("suggestion one") || lower.equals("suggestion two") || lower.equals("suggestion three")
				|| lower.startsWith("suggestion ") || lower.startsWith("option ") || lower.equals("simple option")
				|| lower.equals("natural idiom option") || lower.equals("follow-up question option")
				|| lower.equals("simple direct response") || lower.equals("natural native response")
				|| lower.equals("engaging follow up question") || lower.equals("first realistic sentence student can speak")
				|| lower.equals("second realistic sentence student can speak") || lower.equals("third realistic sentence student can speak")
				|| lower.equals("none") || lower.equals("null")) {
			return null;
		}
		return text;
	}

	private List<String> getDefaultScenarioHints(String scenario) {
		if (scenario == null) {
			return List.of(
				"Could you please tell me more about that?",
				"That sounds great, what should we do next?",
				"What do you recommend in this case?"
			);
		}
		String s = scenario.toLowerCase();
		if (s.contains("daily conversation") || s.contains("small talk") || s.contains("routine")) {
			return List.of(
				"I've had a busy but great day!",
				"How has your day been going so far?",
				"I'm planning to relax and listen to music later."
			);
		} else if (s.contains("restaurant") || s.contains("dining") || s.contains("food") || s.contains("burger")) {
			return List.of(
				"Could I please see the dinner menu?",
				"What do you recommend as today's special?",
				"Could we get the check, please?"
			);
		} else if (s.contains("coffee") || s.contains("cafe")) {
			return List.of(
				"I'd like a medium iced latte with oat milk, please.",
				"Do you have any fresh pastries today?",
				"Can I get this to go, please?"
			);
		} else if (s.contains("hotel") || s.contains("check-in")) {
			return List.of(
				"Hi, I have a reservation under my name.",
				"What time is breakfast served in the morning?",
				"Could you tell me the Wi-Fi password?"
			);
		} else if (s.contains("airport") || s.contains("flight") || s.contains("travel")) {
			return List.of(
				"Here are my passport and boarding pass.",
				"I am traveling for a short vacation.",
				"Which gate does my flight depart from?"
			);
		} else if (s.contains("interview") || s.contains("job") || s.contains("career")) {
			return List.of(
				"I have hands-on experience in problem solving.",
				"My greatest strength is communicating under pressure.",
				"I am excited about this role and your team culture."
			);
		} else if (s.contains("shopping") || s.contains("store") || s.contains("clothes")) {
			return List.of(
				"Excuse me, do you have this in a medium size?",
				"Where are the fitting rooms located?",
				"Is this item currently on discount?"
			);
		} else if (s.contains("doctor") || s.contains("health") || s.contains("hospital")) {
			return List.of(
				"I've been having a mild headache since yesterday.",
				"How often should I take this medication?",
				"Thank you for the helpful advice, doctor."
			);
		} else if (s.contains("zoo") || s.contains("animal")) {
			return List.of(
				"Where can we find the elephant exhibit?",
				"What time is the animal feeding show?",
				"My favorite animals are the giant pandas!"
			);
		} else if (s.contains("school") || s.contains("class") || s.contains("grade") || s.contains("std")) {
			return List.of(
				"Good morning! I finished my homework assignment.",
				"Could you please explain that question again?",
				"My favorite subjects are science and English."
			);
		} else if (s.contains("meeting") || s.contains("business") || s.contains("presentation")) {
			return List.of(
				"Let's review the main milestones on our agenda.",
				"I agree with that strategy and propose next steps.",
				"Does anyone have any questions on this slide?"
			);
		}
		return List.of(
			"Could you tell me a bit more about that?",
			"That sounds interesting, what should we do next?",
			"Could you give me an example of that?"
		);
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

		// 3. Determine Level / Standard / Pedagogical instruction
		String chatLevel = request.getLevel();
		if (chatLevel == null || chatLevel.trim().isEmpty()) {
			chatLevel = session.getUser() != null ? session.getUser().getEnglishLevel() : "Beginner";
		}
		if (chatLevel == null || chatLevel.trim().isEmpty()) {
			chatLevel = "Beginner";
		}

		String levelInstruction = "";
		String cl = chatLevel.toLowerCase();

		if (cl.contains("1st std") || cl.contains("starter")) {
			levelInstruction = "Student Grade: 1st Standard (Ages 6-7 Starter).\n" +
					"Pedagogy: Use ONLY ultra-simple primary words (phonics, simple animal/color words, 3-5 word sentences). Greet warmly like a kind primary teacher. Keep all replies cheerful and very easy.";
		} else if (cl.contains("2nd std")) {
			levelInstruction = "Student Grade: 2nd Standard (Ages 7-8 Elementary).\n" +
					"Pedagogy: Use basic classroom & daily routine vocabulary, simple short sentences (4-7 words), and clear questions.";
		} else if (cl.contains("3rd std")) {
			levelInstruction = "Student Grade: 3rd Standard (Ages 8-9 Upper Elementary).\n" +
					"Pedagogy: Focus on action verbs, telling time, community helpers, and clear sentence structure.";
		} else if (cl.contains("4th std")) {
			levelInstruction = "Student Grade: 4th Standard (Ages 9-10 Pre-Intermediate).\n" +
					"Pedagogy: Introduce comparative words, simple directions, canteen orders, and short paragraph conversation.";
		} else if (cl.contains("5th std")) {
			levelInstruction = "Student Grade: 5th Standard (Ages 10-11 Intermediate).\n" +
					"Pedagogy: Practice intermediate sentence structures, future tense (will / going to), and school project explanations.";
		} else if (cl.contains("6th std")) {
			levelInstruction = "Student Grade: 6th Standard (Ages 11-12 Upper Intermediate).\n" +
					"Pedagogy: Practice debate reasoning, club interviews, polite questions to teachers, and complex sentences.";
		} else if (cl.contains("7th std")) {
			levelInstruction = "Student Grade: 7th Standard (Ages 12-13 Intermediate).\n" +
					"Pedagogy: Focus on environmental discussions, book/film reviews, and formal polite requests (Could you please, I would appreciate).";
		} else if (cl.contains("8th std")) {
			levelInstruction = "Student Grade: 8th Standard (Ages 13-14 Upper Intermediate).\n" +
					"Pedagogy: Encourage structured debate arguments, leadership interviews, technology discussions, and public discourse.";
		} else if (cl.contains("9th std")) {
			levelInstruction = "Student Grade: 9th Standard (Ages 14-15 Advanced).\n" +
					"Pedagogy: Focus on mock admission interviews, structured keynote presentations, current affairs, and diplomatic conflict resolution.";
		} else if (cl.contains("10th std") || cl.contains("board prep")) {
			levelInstruction = "Student Grade: 10th Standard (Board Exam Prep & Oratory Mastery).\n" +
					"Pedagogy: Simulate formal board oral examinations, academic pitch defenses, advanced idioms, and CEFR C1 oratory fluency.";
		} else if ("beginner".equalsIgnoreCase(chatLevel)) {
			levelInstruction = "Current Learner English Level: Beginner (A1-A2).\n" +
					"Instructions: Use extremely simple, clear, and common vocabulary. Speak in very short, basic sentences. Keep your grammar explanations simple and concrete.";
		} else if ("intermediate".equalsIgnoreCase(chatLevel)) {
			levelInstruction = "Current Learner English Level: Intermediate (B1-B2).\n" +
					"Instructions: Use everyday conversational English, standard sentence lengths, and B1-B2 vocabulary. Introduce occasional common idioms with practical explanations.";
		} else { // Advanced
			levelInstruction = "Current Learner English Level: Advanced (C1-C2).\n" +
					"Instructions: Use sophisticated and diverse vocabulary. Use complex sentence structures, advanced idioms, and nuanced stylistic suggestions.";
		}

		User user = session.getUser();
		String userContextInstruction = buildUserContextInstruction(user, session.getScenario());

		List<GroqRequest.Message> groqMessages = new ArrayList<>();
		String systemPrompt = String.format(
				"You are an expert English conversation tutor roleplaying authentically with the student in the scenario: '%s'.\n\n" +
				"LEARNER CONTEXT & SCENARIO:\n" +
				"%s\n" +
				"%s\n\n" +
				"ROLEPLAY & CONVERSATIONAL IMMERSION:\n" +
				"1. IN-CHARACTER DIALOGUE ('aiReply'): Inhabit your persona (e.g. friendly barista, doctor, tour guide, peer, or teacher). Respond naturally in 1-2 lively, empathetic sentences tailored to the student's standard/age. Keep the conversation engaging and fluid.\n" +
				"2. NATIVE PHRASING ('betterSentence'): If the student's expression could be polished into a natural native idiom ('How a native speaker says it'), provide it here. If they spoke naturally and cleanly, set to null.\n" +
				"3. GRAMMAR EVALUATION ('grammarCorrection'): Provide a corrected version only if there were grammatical errors, otherwise set to null.\n" +
				"4. DYNAMIC SPOKEN HINTS ('suggestedResponses'): Provide EXACTLY 3 complete, realistic phrases the student can literally speak out loud next. CRITICAL: Never write 'Suggestion 1', 'Option 1', or placeholder labels. Each must be a real sentence tailored directly to this dialogue.\n" +
				"5. CLEAN TEXT RULES: Never output bracketed meta tags (e.g. [grammar]), never output ellipses '...', and never output stage directions like (smiling).\n\n" +
				"YOU MUST RESPOND IN VALID JSON FORMAT ONLY. Do not wrap in ```json or markdown blocks.\n" +
				"The JSON must have these exact fields and structure:\n" +
				"{\n" +
				"  \"aiReply\": \"Your natural in-character conversational response (1-2 sentences).\",\n" +
				"  \"grammarCorrection\": \"Corrected version if mistake made, otherwise null.\",\n" +
				"  \"betterSentence\": \"Natural native phrasing alternative ('How to say it'), otherwise null.\",\n" +
				"  \"vocabularySuggestions\": \"1-2 vocabulary enrichment words, otherwise null.\",\n" +
				"  \"explanation\": \"A short 1-sentence tutoring note, otherwise null.\",\n" +
				"  \"followUpQuestion\": \"A natural follow-up question to keep the dialogue flowing.\",\n" +
				"  \"nativeTip\": \"A short pronunciation or cadence tip, otherwise null.\",\n" +
				"  \"suggestedResponses\": [\"First realistic sentence student can speak\", \"Second realistic sentence student can speak\", \"Third realistic sentence student can speak\"]\n" +
				"}\n\n" +
				"Important: Escape any double quotes inside string values as \\\" to ensure valid JSON.",
				session.getScenario(),
				levelInstruction,
				userContextInstruction
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
				response.setNativeTip(extractFieldFromJson(cleanJson, "nativeTip"));
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

		// Thoroughly sanitize all text fields from brackets, dot-dot-dot, and markdown
		response.setAiReply(sanitizeSpokenText(response.getAiReply()));
		response.setBetterSentence(sanitizeSpokenText(response.getBetterSentence()));
		response.setGrammarCorrection(sanitizeSpokenText(response.getGrammarCorrection()));
		response.setExplanation(sanitizeSpokenText(response.getExplanation()));
		response.setNativeTip(sanitizeSpokenText(response.getNativeTip()));

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

		// Provide smart suggested response chips if empty or sanitize
		List<String> cleanSuggested = new ArrayList<>();
		if (response.getSuggestedResponses() != null) {
			for (String sug : response.getSuggestedResponses()) {
				String sClean = cleanAndSanitizeHint(sug);
				if (sClean != null && !sClean.isEmpty() && !cleanSuggested.contains(sClean)) {
					cleanSuggested.add(sClean);
				}
			}
		}
		if (cleanSuggested.size() < 2) {
			List<String> fallbacks = getDefaultScenarioHints(session.getScenario());
			for (String fb : fallbacks) {
				if (!cleanSuggested.contains(fb)) {
					cleanSuggested.add(fb);
				}
			}
		}
		response.setSuggestedResponses(cleanSuggested);

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
		long durationSeconds = 30;
		if (session.getCreatedAt() != null) {
			durationSeconds = Duration.between(session.getCreatedAt(), LocalDateTime.now()).toSeconds();
			if (durationSeconds <= 0) durationSeconds = 30;
		}

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

		// Calculate XP reward:
		// Base: 10 XP if session had dialogue or lasted >= 15 seconds
		// Time bonus: 10 XP per full minute
		// Performance bonus: +5 XP for score >= 80%, +10 XP for score >= 90%
		int baseReward = (session.getMessages() != null && session.getMessages().size() >= 2) || durationSeconds >= 15 ? 10 : 5;
		long minutes = durationSeconds / 60;
		int timeBonus = (int) (minutes * 10);
		int scoreBonus = (score >= 90.0) ? 10 : (score >= 80.0 ? 5 : 0);
		int xp = Math.min(100, baseReward + timeBonus + scoreBonus);

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
			int sessionMinutes = (int) Math.max(1, Math.ceil(durationSeconds / 60.0));
			progress.setTotalPracticeMinutes((progress.getTotalPracticeMinutes() == null ? 0 : progress.getTotalPracticeMinutes()) + sessionMinutes);
			progress.setTotalSpeakingSessions((progress.getTotalSpeakingSessions() == null ? 0 : progress.getTotalSpeakingSessions()) + 1);
			int newXp = (progress.getXp() == null ? 0 : progress.getXp()) + xp;
			progress.setXp(newXp);
			progress.setLevel(Math.max(1, (newXp / 500) + 1));
			progressRepository.save(progress);
		} catch (Exception ex) {
			// Ignore progress update errors
		}

		// ── Trigger session-end notification ─────────────────────────────
		try {
			if (session.getUser() != null) {
				int sessionMinutes = (int) Math.max(1, Math.ceil(durationSeconds / 60.0));
				notificationService.createSystemNotification(session.getUser(),
						"Speaking Session Complete! 🎙️",
						"Great job! You practiced \"" + session.getScenario() + "\" for " + sessionMinutes + " min and earned " + xp + " XP.");
			}
		} catch (Exception ex) {
			System.err.println("⚠️ Could not create session notification: " + ex.getMessage());
		}
		
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
				"You are an expert English tutor observing a live practice conversation under the scenario: '%s'.\n" +
				"Based on the conversation history and the latest turn, provide EXACTLY 3 short, distinct, high-impact alternative responses the student could say next:\n" +
				"1. Simple & direct option (3-5 words)\n" +
				"2. Natural & idiomatic conversational option\n" +
				"3. Thoughtful follow-up question or pivot\n" +
				"Keep each suggestion under 8 words. Do not use punctuation tags or emojis.\n" +
				"YOU MUST RESPOND IN VALID JSON FORMAT ONLY. Do not wrap in ```json or markdown blocks.\n" +
				"The JSON must have this exact structure:\n" +
				"{\n" +
				"  \"hints\": [\n" +
				"    \"Simple direct response\",\n" +
				"    \"Natural native response\",\n" +
				"    \"Engaging follow up question\"\n" +
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
				List<String> rawHints = objectMapper.convertValue(node.get("hints"), new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
				if (rawHints != null && !rawHints.isEmpty()) {
					List<String> cleanList = new ArrayList<>();
					for (String h : rawHints) {
						String c = cleanAndSanitizeHint(h);
						if (c != null && !c.isEmpty() && !cleanList.contains(c)) {
							cleanList.add(c);
						}
					}
					if (cleanList.size() >= 2) return cleanList;
				}
			}
		} catch (Exception e) {
			// ignore and fallback
		}

		return getDefaultScenarioHints(session.getScenario());
	}

	private String buildUserContextInstruction(User user, String scenarioName) {
		if (user == null) {
			return "Learner Profile: General English Learner.\nInstructions: Use friendly, clear English suited to everyday conversation.\n";
		}

		boolean isStudent = (user.getRole() == Role.STUDENT) || (user.getSchoolGrade() != null && !user.getSchoolGrade().trim().isEmpty());
		String grade = user.getSchoolGrade();
		String ageGroup = user.getAgeGroup();
		String scenario = (scenarioName != null) ? scenarioName.trim() : "General";
		boolean isBusinessScenario = "Business Meeting".equalsIgnoreCase(scenario) ||
				"Job Interview Practice".equalsIgnoreCase(scenario) ||
				"Salary & Contract Negotiation".equalsIgnoreCase(scenario) ||
				"Presentation Skills".equalsIgnoreCase(scenario);

		StringBuilder sb = new StringBuilder();

		if (isStudent && grade != null && !grade.trim().isEmpty()) {
			String g = grade.trim().toLowerCase();
			sb.append("Learner Profile: School Student (").append(grade).append(").\n");
			if (g.contains("1st") || g.contains("2nd") || g.contains("first") || g.contains("second")) {
				sb.append("School Standard: 1st/2nd Standard (Primary School, Age 6-7).\n")
				  .append("Instructions: Use extremely simple English (3-5 word sentences, Pre-A1/A1). Focus on cheerful, simple roleplays (pets, toys, cartoon friends, school fun). NEVER use adult, job, or financial themes.\n");
			} else if (g.contains("3rd") || g.contains("4th") || g.contains("5th") || g.contains("third") || g.contains("fourth") || g.contains("fifth")) {
				sb.append("School Standard: 3rd-5th Standard (Upper Primary School, Age 8-10).\n")
				  .append("Instructions: Use basic, clear English (A1-A2). Focus on school subjects, friends, hobbies, science, pets, and simple roleplays. Keep sentences short and engaging.\n");
			} else if (g.contains("6th") || g.contains("7th") || g.contains("8th") || g.contains("sixth") || g.contains("seventh") || g.contains("eighth")) {
				sb.append("School Standard: 6th-8th Standard (Middle School, Age 11-13).\n")
				  .append("Instructions: Use friendly, encouraging English (A2-B1). Focus on school projects, sports, games, coding, quizzes, environment, and books.\n");
			} else { // 9th, 10th Standard or High School
				sb.append("School Standard: 9th-10th Standard (High School / Board Exam, Age 14-16).\n")
				  .append("Instructions: Use structured, natural conversational English (B1-B2). Focus on career dreams, technology, space science, social topics, debating, and public speaking.\n");
			}
		} else {
			// Individual User Profile by Age Group
			sb.append("Learner Profile: Individual User.\n");
			if ("Kids".equalsIgnoreCase(ageGroup)) {
				sb.append("Age Group: Kids (Age 6-12).\n")
				  .append("Instructions: Be super enthusiastic and friendly. Use simple words and short sentences (A1). Zero adult or corporate themes.\n");
			} else if ("Teens".equalsIgnoreCase(ageGroup)) {
				sb.append("Age Group: Teens (Age 13-17).\n")
				  .append("Instructions: Be a supportive peer tutor. Use modern, relatable conversational English (A2-B1). Focus on high school life, music, sports, and teen hobbies.\n");
			} else if ("Young Adult".equalsIgnoreCase(ageGroup) || "Young Adults".equalsIgnoreCase(ageGroup)) {
				sb.append("Age Group: Young Adults (Age 18-24).\n")
				  .append("Instructions: Use energetic, natural conversational English (B1-B2). Focus on college life, travel, technology, and social confidence.\n");
			} else if ("Senior".equalsIgnoreCase(ageGroup) || "Seniors".equalsIgnoreCase(ageGroup)) {
				sb.append("Age Group: Seniors (Age 50+).\n")
				  .append("Instructions: Be warm, patient, and respectful. Focus on culture, books, gardening, travel, and life experiences.\n");
			} else { // Professional / Working Adult (25-50) or default
				sb.append("Age Group: Adults (Age 25-50).\n");
				if (isBusinessScenario) {
					sb.append("Instructions: Focus on Business English, corporate meeting scenarios, presentations, formal tone, and professional workplace communication.\n");
				} else {
					sb.append("Instructions: Roleplay naturally as a friendly adult peer about daily life, cooking, fitness, travel, and personal interests. STRICT RULE: DO NOT steer the conversation into corporate meetings, office projects, or business jargon unless the scenario explicitly calls for it.\n");
				}
			}
		}

		if (!isBusinessScenario) {
			sb.append("TOPIC GUARDRAIL: The active scenario is '").append(scenario).append("'. Stick strictly to this scenario. Do NOT turn conversations into business, office, or corporate meetings unless the user explicitly requests it.\n");
		}

		return sb.toString();
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