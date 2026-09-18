package com.rslsolution.speakmateai.assistant.provider;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.LessonProgress;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.SpeakingSession;
import com.rslsolution.speakmateai.entity.User;
import java.util.stream.Collectors;
import com.rslsolution.speakmateai.entity.GrammarHistory;
import com.rslsolution.speakmateai.entity.Vocabulary;
import com.rslsolution.speakmateai.repository.GrammarHistoryRepository;
import com.rslsolution.speakmateai.repository.LessonProgressRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.VocabularyRepository;

/**
 * Caller's own learning progress, available to both STUDENT and USER (Learner) roles.
 * Provides a comprehensive snapshot of XP, streaks, completed lessons, speaking practice,
 * fluency metrics, vocabulary words, and grammar checks.
 */
@Component
public class SelfProgressDataProvider implements AssistantDataProvider {

	private final UserRepository userRepository;
	private final ProgressRepository progressRepository;
	private final LessonProgressRepository lessonProgressRepository;
	private final SpeakingSessionRepository speakingSessionRepository;
	private final VocabularyRepository vocabularyRepository;
	private final GrammarHistoryRepository grammarHistoryRepository;
	private final ObjectMapper objectMapper;

	public SelfProgressDataProvider(UserRepository userRepository,
			ProgressRepository progressRepository,
			LessonProgressRepository lessonProgressRepository,
			SpeakingSessionRepository speakingSessionRepository,
			VocabularyRepository vocabularyRepository,
			GrammarHistoryRepository grammarHistoryRepository,
			ObjectMapper objectMapper) {
		this.userRepository = userRepository;
		this.progressRepository = progressRepository;
		this.lessonProgressRepository = lessonProgressRepository;
		this.speakingSessionRepository = speakingSessionRepository;
		this.vocabularyRepository = vocabularyRepository;
		this.grammarHistoryRepository = grammarHistoryRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.STUDENT_PERFORMANCE;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Long targetUserId = actor.getUserId() != null ? actor.getUserId() : actor.getStudentId();
		Optional<User> me = userRepository.findById(targetUserId == null ? -1L : targetUserId);
		if (me.isEmpty()) {
			// Try fallback via email
			if (actor.getEmail() != null) {
				me = userRepository.findByEmail(actor.getEmail());
			}
		}

		Map<String, Object> data = new LinkedHashMap<>();
		if (me.isEmpty()) {
			data.put("message", "NO DATA");
			data.put("reason", "User profile not found.");
			return toJson(data);
		}

		User user = me.get();
		Progress p = progressRepository.findByUser(user).orElse(null);

		// Lesson metrics
		long lessonsCompleted = lessonProgressRepository.countByUserIdAndCompletedTrue(user.getId());
		List<LessonProgress> lessonRows = lessonProgressRepository.findByUser(user);
		long lessonsStarted = lessonRows.size();
		long lessonsPending = Math.max(0L, lessonsStarted - lessonsCompleted);

		// Speaking sessions & speech metrics
		List<SpeakingSession> sessions = speakingSessionRepository.findByUser(user);
		int totalSessions = sessions.size();
		int completedSessions = (int) sessions.stream().filter(s -> Boolean.TRUE.equals(s.getCompleted())).count();
		double totalFluency = 0;
		double totalPronunciation = 0;
		double totalGrammar = 0;
		double totalVocab = 0;
		double totalOverall = 0;
		int scoredCount = 0;

		for (SpeakingSession s : sessions) {
			if (s.getOverallScore() != null || s.getScore() != null) {
				scoredCount++;
				if (s.getFluencyScore() != null) totalFluency += s.getFluencyScore();
				if (s.getPronunciationScore() != null) totalPronunciation += s.getPronunciationScore();
				if (s.getGrammarScore() != null) totalGrammar += s.getGrammarScore();
				if (s.getVocabularyScore() != null) totalVocab += s.getVocabularyScore();
				double overall = s.getOverallScore() != null ? s.getOverallScore() : (s.getScore() != null ? s.getScore() : 0.0);
				totalOverall += overall;
			}
		}

		double avgFluency = scoredCount > 0 ? Math.round((totalFluency / scoredCount) * 10.0) / 10.0 : 0.0;
		double avgPronunciation = scoredCount > 0 ? Math.round((totalPronunciation / scoredCount) * 10.0) / 10.0 : 0.0;
		double avgGrammar = scoredCount > 0 ? Math.round((totalGrammar / scoredCount) * 10.0) / 10.0 : 0.0;
		double avgVocab = scoredCount > 0 ? Math.round((totalVocab / scoredCount) * 10.0) / 10.0 : 0.0;
		double avgOverall = scoredCount > 0 ? Math.round((totalOverall / scoredCount) * 10.0) / 10.0 : 0.0;

		// Vocabulary words
		List<Vocabulary> vocabs = vocabularyRepository.findByUserOrderByCreatedAtDesc(user);
		int totalVocabularyWords = vocabs.size();
		int masteredVocabularyWords = (int) vocabs.stream().filter(v -> Boolean.TRUE.equals(v.getMastered())).count();
		List<String> recentVocabWords = vocabs.stream()
				.limit(10)
				.map(Vocabulary::getWord)
				.filter(w -> w != null && !w.isBlank())
				.collect(Collectors.toList());

		// Grammar checks
		List<GrammarHistory> grammarChecks = grammarHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
		int totalGrammarChecks = grammarChecks.size();
		double totalGrammarScore = 0;
		int scoredGrammarCount = 0;
		for (GrammarHistory g : grammarChecks) {
			if (g.getGrammarScore() != null && g.getGrammarScore() > 0) {
				totalGrammarScore += g.getGrammarScore();
				scoredGrammarCount++;
			}
		}
		double avgGrammarScore = scoredGrammarCount > 0 ? Math.round((totalGrammarScore / scoredGrammarCount) * 10.0) / 10.0 : 0.0;

		data.put("scope", "SELF (own progress only)");
		data.put("studentName", fullName(user));
		data.put("role", user.getRole() != null ? user.getRole().name() : "USER");

		if (user.getStandard() != null && !user.getStandard().isBlank()) {
			data.put("standard", user.getStandard());
		}
		if (user.getDivision() != null && !user.getDivision().isBlank()) {
			data.put("division", user.getDivision());
		}
		if (user.getRollNumber() != null && !user.getRollNumber().isBlank()) {
			data.put("rollNumber", user.getRollNumber());
		}
		if (user.getSchoolName() != null && !user.getSchoolName().isBlank()) {
			data.put("schoolName", user.getSchoolName());
		}

		if (p != null) {
			data.put("xp", zeroIfNull(p.getXp()));
			data.put("level", Math.max(1, zeroIfNull(p.getLevel())));
			data.put("currentStreak", zeroIfNull(p.getCurrentStreak()));
			data.put("longestStreak", zeroIfNull(p.getLongestStreak()));
			data.put("totalPracticeMinutes", zeroIfNull(p.getTotalPracticeMinutes()));
		} else {
			data.put("xp", 0);
			data.put("level", 1);
			data.put("currentStreak", 0);
			data.put("longestStreak", 0);
			data.put("totalPracticeMinutes", 0);
		}

		data.put("totalSpeakingSessions", totalSessions);
		data.put("completedSpeakingSessions", completedSessions);
		data.put("totalVocabularyWords", totalVocabularyWords);
		data.put("masteredVocabularyWords", masteredVocabularyWords);
		if (!recentVocabWords.isEmpty()) {
			data.put("recentVocabularyWords", recentVocabWords);
		}
		data.put("totalGrammarChecks", totalGrammarChecks);
		if (scoredGrammarCount > 0) {
			data.put("averageGrammarScore", avgGrammarScore);
		}

		data.put("lessonsCompleted", lessonsCompleted);
		data.put("lessonsStarted", lessonsStarted);
		data.put("lessonsPending", lessonsPending);

		if (scoredCount > 0) {
			data.put("fluencyScore", avgFluency);
			data.put("pronunciationScore", avgPronunciation);
			data.put("grammarScore", avgGrammar);
			data.put("vocabularyScore", avgVocab);
			data.put("overallSpeakingScore", avgOverall);
		}

		boolean hasStarted = (lessonsCompleted > 0 || totalSessions > 0 || (p != null && p.getXp() != null && p.getXp() > 0));
		data.put("hasStartedLearning", hasStarted);

		return toJson(data);
	}

	private int zeroIfNull(Integer value) {
		return value == null ? 0 : value;
	}

	private String fullName(User u) {
		String first = u.getFirstName() != null ? u.getFirstName() : "";
		String last = u.getLastName() != null ? u.getLastName() : "";
		String combined = (first + " " + last).trim();
		return combined.isEmpty() ? "Learner" : combined;
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
