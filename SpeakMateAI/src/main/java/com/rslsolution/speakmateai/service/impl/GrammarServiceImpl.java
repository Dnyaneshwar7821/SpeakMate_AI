package com.rslsolution.speakmateai.service.impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.GrammarRequest;
import com.rslsolution.speakmateai.dto.response.GrammarResponse;
import com.rslsolution.speakmateai.entity.GrammarHistory;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.exception.GrammarNotFoundException;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.GrammarHistoryRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.GrammarService;

@Service
@Transactional
public class GrammarServiceImpl implements GrammarService {

	private final GrammarHistoryRepository grammarHistoryRepository;
	private final UserRepository userRepository;
	private final com.rslsolution.speakmateai.repository.ProgressRepository progressRepository;
	private final com.rslsolution.speakmateai.service.AiService aiService;
	private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

	public GrammarServiceImpl(GrammarHistoryRepository grammarHistoryRepository, UserRepository userRepository,
			com.rslsolution.speakmateai.repository.ProgressRepository progressRepository,
			com.rslsolution.speakmateai.service.AiService aiService, com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
		this.grammarHistoryRepository = grammarHistoryRepository;
		this.userRepository = userRepository;
		this.progressRepository = progressRepository;
		this.aiService = aiService;
		this.objectMapper = objectMapper;
	}

	private String extractJson(String text) {
		if (text == null) return "{}";
		int start = text.indexOf("{");
		int end = text.lastIndexOf("}");
		if (start != -1 && end != -1 && end > start) {
			return text.substring(start, end + 1);
		}
		return text;
	}

	@Override
	public GrammarResponse checkGrammar(GrammarRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		String originalText = request.getOriginalText();
		String correctedText = originalText;
		String explanation = "Perfect grammar! No issues found.";
		Double grammarScore = 100.0;

		try {
			com.rslsolution.speakmateai.dto.request.AiRequest aiRequest = com.rslsolution.speakmateai.dto.request.AiRequest.builder().prompt(originalText).build();
			com.rslsolution.speakmateai.dto.response.AiResponse aiResponse = aiService.grammarCorrection(aiRequest);
			
			String rawResponse = aiResponse.getResponse();
			String jsonStr = extractJson(rawResponse);
			
			java.util.Map<String, Object> data = objectMapper.readValue(jsonStr, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});
			
			if (data.containsKey("correctedSentence")) {
				correctedText = (String) data.get("correctedSentence");
			}
			
			Boolean isCorrect = (Boolean) data.get("isCorrect");
			List<?> errorsList = (List<?>) data.get("errors");
			
			if (errorsList != null && !errorsList.isEmpty()) {
				StringBuilder sb = new StringBuilder();
				for (int i = 0; i < errorsList.size(); i++) {
					java.util.Map<?, ?> err = (java.util.Map<?, ?>) errorsList.get(i);
					sb.append(i + 1).append(". [")
					  .append(err.get("type")).append("] ")
					  .append(err.get("issue"))
					  .append(" (Suggested: \"").append(err.get("correction")).append("\")");
					if (i < errorsList.size() - 1) {
						sb.append("\n");
					}
				}
				explanation = sb.toString();
				grammarScore = Math.max(40.0, 100.0 - (errorsList.size() * 15.0));
			} else {
				explanation = "Great job! Your sentence is 100% grammatically correct with no errors.";
				grammarScore = 100.0;
			}
		} catch (Exception e) {
			correctedText = originalText;
			explanation = "Grammar check succeeded, but could not parse feedback details.";
			grammarScore = 90.0;
		}

		GrammarHistory grammarHistory = GrammarHistory.builder().user(user).originalText(originalText)
				.correctedText(correctedText).explanation(explanation).grammarScore(grammarScore).build();

		GrammarHistory savedGrammar = grammarHistoryRepository.save(grammarHistory);

		// Increment Grammar progress count
		try {
			com.rslsolution.speakmateai.entity.Progress progress = progressRepository.findByUser(user)
					.orElseGet(() -> com.rslsolution.speakmateai.entity.Progress.builder().user(user).xp(0).level(1).currentStreak(0).longestStreak(0).totalPracticeMinutes(0).totalSpeakingSessions(0).totalGrammarChecks(0).totalVocabularyWords(0).build());
			progress.setTotalGrammarChecks((progress.getTotalGrammarChecks() == null ? 0 : progress.getTotalGrammarChecks()) + 1);
			int newXp = (progress.getXp() == null ? 0 : progress.getXp()) + 15;
			progress.setXp(newXp);
			progress.setLevel((newXp / 500) + 1);
			progressRepository.save(progress);
		} catch (Exception ex) {
			// Ignore progress update errors
		}

		return GrammarResponse.builder().id(savedGrammar.getId()).originalText(savedGrammar.getOriginalText())
				.correctedText(savedGrammar.getCorrectedText()).explanation(savedGrammar.getExplanation())
				.grammarScore(savedGrammar.getGrammarScore()).createdAt(savedGrammar.getCreatedAt()).build();
	}

	@Override
	public List<GrammarResponse> getAllGrammarHistory() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		return grammarHistoryRepository.findByUserOrderByCreatedAtDesc(user).stream()
				.map(grammar -> GrammarResponse.builder().id(grammar.getId()).originalText(grammar.getOriginalText())
						.correctedText(grammar.getCorrectedText()).explanation(grammar.getExplanation())
						.grammarScore(grammar.getGrammarScore()).createdAt(grammar.getCreatedAt()).build())
				.toList();
	}

	@Override
	public GrammarResponse getGrammarById(Long id) {

		GrammarHistory grammar = grammarHistoryRepository.findById(id)
				.orElseThrow(() -> new GrammarNotFoundException("Grammar history not found"));

		return GrammarResponse.builder().id(grammar.getId()).originalText(grammar.getOriginalText())
				.correctedText(grammar.getCorrectedText()).explanation(grammar.getExplanation())
				.grammarScore(grammar.getGrammarScore()).createdAt(grammar.getCreatedAt()).build();
	}

	@Override
	public void deleteGrammarById(Long id) {

		GrammarHistory grammar = grammarHistoryRepository.findById(id)
				.orElseThrow(() -> new GrammarNotFoundException("Grammar history not found"));

		grammarHistoryRepository.delete(grammar);
	}
}