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
import com.rslsolution.speakmateai.entity.UserSubscription;
import com.rslsolution.speakmateai.entity.Vocabulary;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;
import com.rslsolution.speakmateai.repository.GrammarHistoryRepository;
import com.rslsolution.speakmateai.repository.LessonProgressRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;
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
	private final UserSubscriptionRepository userSubscriptionRepository;
	private final ObjectMapper objectMapper;

	public SelfProgressDataProvider(UserRepository userRepository,
			ProgressRepository progressRepository,
			LessonProgressRepository lessonProgressRepository,
			SpeakingSessionRepository speakingSessionRepository,
			VocabularyRepository vocabularyRepository,
			GrammarHistoryRepository grammarHistoryRepository,
			UserSubscriptionRepository userSubscriptionRepository,
			ObjectMapper objectMapper) {
		this.userRepository = userRepository;
		this.progressRepository = progressRepository;
		this.lessonProgressRepository = lessonProgressRepository;
		this.speakingSessionRepository = speakingSessionRepository;
		this.vocabularyRepository = vocabularyRepository;
		this.grammarHistoryRepository = grammarHistoryRepository;
		this.userSubscriptionRepository = userSubscriptionRepository;
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

		// Defensive Cross-Student Privacy Guard:
		// Students and Learners are strictly restricted to their own metrics.
		// If a target student name or email is specified that does not match the caller,
		// deny access immediately.
		String requestedTarget = strParam(params, "studentName");
		if (requestedTarget.isEmpty()) {
			requestedTarget = strParam(params, "name");
		}
		if (requestedTarget.isEmpty()) {
			requestedTarget = strParam(params, "studentEmail");
		}
		if (requestedTarget.isEmpty()) {
			requestedTarget = strParam(params, "email");
		}
		if (!requestedTarget.isEmpty() && !isCallerIdentity(user, requestedTarget)) {
			Map<String, Object> denial = new LinkedHashMap<>();
			denial.put("accessDenied", true);
			denial.put("reason", "CROSS_STUDENT_DENIED");
			denial.put("requestedTarget", requestedTarget);
			denial.put("scope", "SELF");
			denial.put("message", "You do not have permission to view other students' learning progress.");
			return toJson(denial);
		}

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
				.map(v -> v.getWord())
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

		List<String> completedLessonTitles = lessonRows.stream()
				.filter(lp -> Boolean.TRUE.equals(lp.getCompleted()) && lp.getLesson() != null && lp.getLesson().getTitle() != null && !lp.getLesson().getTitle().isBlank())
				.map(lp -> lp.getLesson().getTitle().trim())
				.distinct()
				.collect(Collectors.toList());
		data.put("completedLessonTitles", completedLessonTitles);

		if (!grammarChecks.isEmpty()) {
			GrammarHistory latest = grammarChecks.get(0);
			Map<String, Object> latestGrammar = new LinkedHashMap<>();
			latestGrammar.put("originalText", latest.getOriginalText());
			latestGrammar.put("correctedText", latest.getCorrectedText());
			latestGrammar.put("explanation", latest.getExplanation());
			latestGrammar.put("grammarScore", latest.getGrammarScore());
			data.put("lastGrammarCheck", latestGrammar);
		}

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

		int currentXp = p != null ? zeroIfNull(p.getXp()) : 0;
		int currentLevel = p != null ? Math.max(1, zeroIfNull(p.getLevel())) : 1;
		int nextLevel = currentLevel + 1;
		int nextLevelThreshold = currentLevel * 500;
		int xpRemaining = Math.max(0, nextLevelThreshold - currentXp);

		data.put("xp", currentXp);
		data.put("level", currentLevel);
		data.put("nextLevel", nextLevel);
		data.put("nextLevelThreshold", nextLevelThreshold);
		data.put("xpRemaining", xpRemaining);
		if (p != null) {
			data.put("currentStreak", zeroIfNull(p.getCurrentStreak()));
			data.put("longestStreak", zeroIfNull(p.getLongestStreak()));
			data.put("totalPracticeMinutes", zeroIfNull(p.getTotalPracticeMinutes()));
		} else {
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

		// Subscription & plan details
		try {
			Optional<UserSubscription> activeSub = userSubscriptionRepository.findFirstByUserIdAndSubscriptionStatus(user.getId(), SubscriptionStatus.ACTIVE);
			if (activeSub.isPresent()) {
				UserSubscription sub = activeSub.get();
				String plan = sub.getPlanType() != null ? sub.getPlanType() : "PRO Plan";
				data.put("currentSubscription", plan);
				data.put("subscriptionPlan", plan);
				data.put("subscriptionStatus", "ACTIVE");
			} else {
				data.put("currentSubscription", "Free Tier");
				data.put("subscriptionPlan", "Free Tier");
				data.put("subscriptionStatus", "FREE");
			}
		} catch (Exception e) {
			data.put("currentSubscription", "Free Tier");
			data.put("subscriptionPlan", "Free Tier");
		}

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

	private boolean isCallerIdentity(User user, String requested) {
		if (requested == null || requested.isBlank()) {
			return true;
		}
		String req = requested.trim().toLowerCase(java.util.Locale.ROOT);
		if (req.equals("my") || req.equals("me") || req.equals("myself") || req.equals("self")
				|| req.equals("own") || req.equals("i")) {
			return true;
		}
		if (user.getEmail() != null && user.getEmail().equalsIgnoreCase(requested.trim())) {
			return true;
		}
		String first = user.getFirstName() != null ? user.getFirstName().trim().toLowerCase(java.util.Locale.ROOT) : "";
		String last = user.getLastName() != null ? user.getLastName().trim().toLowerCase(java.util.Locale.ROOT) : "";
		String full = (first + " " + last).trim();
		if (!full.isEmpty() && (full.contains(req) || req.contains(full))) {
			return true;
		}
		if (!first.isEmpty() && (first.contains(req) || req.contains(first))) {
			return true;
		}
		if (user instanceof com.rslsolution.speakmateai.entity.Student s
				&& s.getStudentId() != null && s.getStudentId().equalsIgnoreCase(requested.trim())) {
			return true;
		}
		if (user.getRollNumber() != null && user.getRollNumber().equalsIgnoreCase(requested.trim())) {
			return true;
		}
		if (String.valueOf(user.getId()).equals(requested.trim())) {
			return true;
		}
		return false;
	}

	private String strParam(Map<String, Object> params, String key) {
		if (params == null) {
			return "";
		}
		Object v = params.get(key);
		return v == null ? "" : v.toString().trim();
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
