package com.rslsolution.speakmateai.assistant.provider;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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

import com.rslsolution.speakmateai.entity.Achievement;
import com.rslsolution.speakmateai.entity.AssignmentProgress;
import com.rslsolution.speakmateai.entity.Lesson;
import com.rslsolution.speakmateai.repository.AchievementRepository;
import com.rslsolution.speakmateai.repository.AssignmentProgressRepository;
import com.rslsolution.speakmateai.repository.AssignmentRepository;
import com.rslsolution.speakmateai.repository.LessonRepository;

import com.rslsolution.speakmateai.assistant.TeacherAssignmentResolver;

/**
 * Caller's own learning progress, available to both STUDENT and USER (Learner) roles.
 * Provides a comprehensive snapshot of XP, streaks, completed lessons, speaking practice,
 * fluency metrics, vocabulary words, and grammar checks.
 */
@Component
@Transactional(readOnly = true)
public class SelfProgressDataProvider implements AssistantDataProvider {

	private final UserRepository userRepository;
	private final ProgressRepository progressRepository;
	private final LessonProgressRepository lessonProgressRepository;
	private final SpeakingSessionRepository speakingSessionRepository;
	private final VocabularyRepository vocabularyRepository;
	private final GrammarHistoryRepository grammarHistoryRepository;
	private final UserSubscriptionRepository userSubscriptionRepository;
	private final LessonRepository lessonRepository;
	private final AchievementRepository achievementRepository;
	private final AssignmentProgressRepository assignmentProgressRepository;
	private final AssignmentRepository assignmentRepository;
	private final TeacherAssignmentResolver teacherAssignmentResolver;
	private final ObjectMapper objectMapper;

	public SelfProgressDataProvider(UserRepository userRepository,
			ProgressRepository progressRepository,
			LessonProgressRepository lessonProgressRepository,
			SpeakingSessionRepository speakingSessionRepository,
			VocabularyRepository vocabularyRepository,
			GrammarHistoryRepository grammarHistoryRepository,
			UserSubscriptionRepository userSubscriptionRepository,
			LessonRepository lessonRepository,
			AchievementRepository achievementRepository,
			AssignmentProgressRepository assignmentProgressRepository,
			AssignmentRepository assignmentRepository,
			@org.springframework.beans.factory.annotation.Autowired(required = false) TeacherAssignmentResolver teacherAssignmentResolver,
			ObjectMapper objectMapper) {
		this.userRepository = userRepository;
		this.progressRepository = progressRepository;
		this.lessonProgressRepository = lessonProgressRepository;
		this.speakingSessionRepository = speakingSessionRepository;
		this.vocabularyRepository = vocabularyRepository;
		this.grammarHistoryRepository = grammarHistoryRepository;
		this.userSubscriptionRepository = userSubscriptionRepository;
		this.lessonRepository = lessonRepository;
		this.achievementRepository = achievementRepository;
		this.assignmentProgressRepository = assignmentProgressRepository;
		this.assignmentRepository = assignmentRepository;
		this.teacherAssignmentResolver = teacherAssignmentResolver;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.STUDENT_PERFORMANCE;
	}

	@Override
	@Transactional
	public String provide(ActorContext actor, Map<String, Object> params) {
		Long targetUserId = actor.getUserId() != null ? actor.getUserId() : actor.getStudentId();
		Optional<User> me = userRepository.findById(targetUserId == null ? -1L : targetUserId);
		if (me.isEmpty()) {
			// Try fallback via email
			if (actor.getEmail() != null) {
				me = userRepository.findByEmailIgnoreCase(actor.getEmail());
				if (me.isEmpty()) {
					me = userRepository.findByEmail(actor.getEmail());
				}
			}
		}

		Map<String, Object> data = new LinkedHashMap<>();
		if (me.isEmpty()) {
			data.put("message", "NO DATA");
			data.put("reason", "User profile not found.");
			return toJson(data);
		}

		User user = me.get();
		if (targetUserId == null) {
			targetUserId = user.getId();
		}

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
			if (isValidOtherStudentIdentity(requestedTarget)) {
				Map<String, Object> denial = new LinkedHashMap<>();
				denial.put("accessDenied", true);
				denial.put("reason", "CROSS_STUDENT_DENIED");
				denial.put("requestedTarget", requestedTarget);
				denial.put("scope", "SELF");
				denial.put("message", "You do not have permission to view other students' learning progress.");
				return toJson(denial);
			}
		}

		Progress p = null;
		if (targetUserId != null) {
			p = progressRepository.findByUserId(targetUserId).orElse(null);
		}
		if (p == null) {
			p = progressRepository.findByUser(user).orElseGet(() -> {
				Progress defaultProgress = Progress.builder()
						.user(user)
						.xp(0)
						.level(1)
						.currentStreak(0)
						.longestStreak(0)
						.totalPracticeMinutes(0)
						.totalSpeakingSessions(0)
						.totalGrammarChecks(0)
						.totalVocabularyWords(0)
						.build();
				try {
					return progressRepository.save(defaultProgress);
				} catch (Exception ex) {
					return defaultProgress;
				}
			});
		}

		// Lesson metrics
		List<LessonProgress> lessonRows = List.of();
		if (targetUserId != null) {
			lessonRows = lessonProgressRepository.findByUserId(targetUserId);
		}
		if (lessonRows.isEmpty()) {
			lessonRows = lessonProgressRepository.findByUser(user);
		}
		long lessonsCompleted = 0;
		if (targetUserId != null) {
			lessonsCompleted = lessonProgressRepository.countByUserIdAndCompletedTrue(targetUserId);
		}
		if (lessonsCompleted == 0 && !lessonRows.isEmpty()) {
			lessonsCompleted = lessonRows.stream().filter(lp -> Boolean.TRUE.equals(lp.getCompleted())).count();
		}
		long lessonsStarted = lessonRows.size();
		long lessonsPending = Math.max(0L, lessonsStarted - lessonsCompleted);

		// Speaking sessions & speech metrics
		List<SpeakingSession> sessions = List.of();
		if (targetUserId != null) {
			sessions = speakingSessionRepository.findByUserIdOrderByCreatedAtDesc(targetUserId);
		}
		if (sessions.isEmpty()) {
			sessions = speakingSessionRepository.findByUser(user);
		}
		int totalSessions = sessions.size();
		int completedSessions = (int) sessions.stream().filter(s -> Boolean.TRUE.equals(s.getCompleted())).count();
		// If sessions query returned empty but progress record has cached count, fallback to progress record
		if (completedSessions == 0 && p != null && p.getTotalSpeakingSessions() != null && p.getTotalSpeakingSessions() > 0) {
			completedSessions = p.getTotalSpeakingSessions();
			if (totalSessions < completedSessions) {
				totalSessions = completedSessions;
			}
		}

		double totalFluency = 0;
		double totalPronunciation = 0;
		double totalGrammar = 0;
		double totalVocab = 0;
		double totalOverall = 0;
		int scoredCount = 0;

		for (SpeakingSession s : sessions) {
			if (Boolean.TRUE.equals(s.getCompleted()) && (s.getOverallScore() != null || s.getScore() != null)) {
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
		List<Vocabulary> vocabs = List.of();
		if (targetUserId != null) {
			vocabs = vocabularyRepository.findByUserIdOrderByCreatedAtDesc(targetUserId);
		}
		if (vocabs.isEmpty()) {
			vocabs = vocabularyRepository.findByUserOrderByCreatedAtDesc(user);
		}
		int totalVocabularyWords = vocabs.size();
		if (totalVocabularyWords == 0 && p != null && p.getTotalVocabularyWords() != null && p.getTotalVocabularyWords() > 0) {
			totalVocabularyWords = p.getTotalVocabularyWords();
		}
		int masteredVocabularyWords = (int) vocabs.stream().filter(v -> Boolean.TRUE.equals(v.getMastered())).count();
		List<String> recentVocabWords = vocabs.stream()
				.limit(10)
				.map(v -> v.getWord())
				.filter(w -> w != null && !w.isBlank())
				.collect(Collectors.toList());

		// Grammar checks
		List<GrammarHistory> grammarChecks = List.of();
		if (targetUserId != null) {
			grammarChecks = grammarHistoryRepository.findByUserIdOrderByCreatedAtDesc(targetUserId);
		}
		if (grammarChecks.isEmpty()) {
			grammarChecks = grammarHistoryRepository.findByUserOrderByCreatedAtDesc(user);
		}
		int totalGrammarChecks = grammarChecks.size();
		if (totalGrammarChecks == 0 && p != null && p.getTotalGrammarChecks() != null && p.getTotalGrammarChecks() > 0) {
			totalGrammarChecks = p.getTotalGrammarChecks();
		}
		double totalGrammarScore = 0;
		int scoredGrammarCount = 0;
		for (GrammarHistory g : grammarChecks) {
			if (g.getGrammarScore() != null && g.getGrammarScore() > 0) {
				totalGrammarScore += g.getGrammarScore();
				scoredGrammarCount++;
			}
		}
		double avgGrammarScore = scoredGrammarCount > 0 ? Math.round((totalGrammarScore / scoredGrammarCount) * 10.0) / 10.0 : 0.0;

		List<String> completedLessonTitles = new java.util.ArrayList<>();
		for (LessonProgress lp : lessonRows) {
			if (Boolean.TRUE.equals(lp.getCompleted())) {
				try {
					if (lp.getLesson() != null && lp.getLesson().getTitle() != null && !lp.getLesson().getTitle().isBlank()) {
						String title = lp.getLesson().getTitle().trim();
						if (!completedLessonTitles.contains(title)) {
							completedLessonTitles.add(title);
						}
					}
				} catch (Exception ex) {
					// Guard against lazy proxy resolution issues
				}
			}
		}
		data.put("completedLessonTitles", completedLessonTitles);

		// Available lessons catalog & recommended next lesson (Master 120 Academic Curriculum)
		List<String> masterFoundationalTitles = List.of(
				"Mastering Short & Long Vowels",
				"Sounds of Blends & Digraphs",
				"Naming Words: All About Nouns",
				"Common vs. Proper Nouns",
				"Singular & Plural Nouns",
				"Pronouns: Replacing Names",
				"Action Verbs in Motion",
				"Helping Verbs: Am, Is & Are",
				"Adjectives: Describing Words",
				"Opposite Words & Antonyms",
				"Prepositions of Place",
				"Building Complete Sentences",
				"Using Articles: A, An & The",
				"Simple Present Tense & Habits",
				"The 8 Parts of Speech",
				"Mastering the 12 Verb Tenses"
		);

		String recommendedNextLesson = "Mastering Short & Long Vowels";
		String userStd = user.getStandard() != null ? user.getStandard() : user.getSchoolGrade();
		String userAge = user.getAgeGroup();
		if (userStd != null && !userStd.isBlank()) {
			int gradeNum = 1;
			try {
				java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\d+").matcher(userStd);
				if (m.find()) gradeNum = Integer.parseInt(m.group());
			} catch (Exception ignored) {}
			if (gradeNum >= 9) {
				recommendedNextLesson = "Board Exam Viva & Oral Prep";
			} else if (gradeNum >= 5) {
				recommendedNextLesson = "The 8 Parts of Speech";
			} else {
				recommendedNextLesson = "Mastering Short & Long Vowels";
			}
		} else if (userAge != null && !userAge.isBlank()) {
			String ageLower = userAge.toLowerCase(java.util.Locale.ROOT);
			if (ageLower.contains("kid") || ageLower.contains("6-12")) {
				recommendedNextLesson = "Rhyming Words & Word Families";
			} else if (ageLower.contains("teen") || ageLower.contains("13-24") || ageLower.contains("young")) {
				recommendedNextLesson = "Fixing Run-ons & Fragments";
			} else if (ageLower.contains("senior") || ageLower.contains("prof") || ageLower.contains("25+")) {
				recommendedNextLesson = "Executive Precision & Grammar";
			}
		}

		long totalAvailableLessons = 0;
		List<String> availableLessonTitles = new ArrayList<>();
		try {
			totalAvailableLessons = lessonRepository.countByActiveTrue();
			List<Lesson> activeList = lessonRepository.findByActiveTrue();
			if (activeList != null && !activeList.isEmpty()) {
				List<Lesson> sortedList = activeList.stream()
						.filter(l -> l.getTitle() != null && !l.getTitle().isBlank() && !l.getTitle().matches("(?i)^Lesson\\s+\\d+$"))
						.sorted(Comparator.comparing((Lesson l) -> l.getOrderIndex() != null ? l.getOrderIndex() : 9999))
						.collect(Collectors.toList());

				if (!sortedList.isEmpty()) {
					availableLessonTitles = sortedList.stream()
							.map(Lesson::getTitle)
							.filter(t -> t != null && !t.isBlank())
							.distinct()
							.limit(12)
							.collect(Collectors.toList());

					for (Lesson l : sortedList) {
						String title = l.getTitle().trim();
						if (!completedLessonTitles.contains(title)) {
							recommendedNextLesson = title;
							break;
						}
					}
				}
			}
		} catch (Exception e) {
			// fallback
		}

		if (availableLessonTitles.isEmpty()) {
			availableLessonTitles = new ArrayList<>(masterFoundationalTitles);
			for (String t : masterFoundationalTitles) {
				if (!completedLessonTitles.contains(t)) {
					recommendedNextLesson = t;
					break;
				}
			}
		}

		long resolvedLessonsCount = Math.max(totalAvailableLessons, 120L);
		data.put("totalAvailableLessons", resolvedLessonsCount);
		data.put("availableLessonTitles", availableLessonTitles);
		data.put("recommendedNextLesson", recommendedNextLesson);
		data.put("curriculumBreakdown", "120 Academic Lessons across Beginner (1-40), Intermediate (41-80), and Advanced (81-120)");
		data.put("curriculumLevels", Map.of(
				"Beginner", "40 Lessons (Lessons 1-40: Phonics, Nouns, Pronouns, Verbs, Articles, Simple Sentences)",
				"Intermediate", "40 Lessons (Lessons 41-80: 12 Verb Tenses, Modals, Active/Passive Voice, Reported Speech)",
				"Advanced", "40 Lessons (Lessons 81-120: Complex Clauses, Executive Oratory, Workplace & Professional Fluency)"
		));

		// Achievements milestones
		int unlockedAchievementsCount = 0;
		List<String> unlockedAchievementTitles = new ArrayList<>();
		try {
			List<Achievement> userAchievements = List.of();
			if (targetUserId != null) {
				userAchievements = achievementRepository.findByUserIdAndUnlockedTrue(targetUserId);
			}
			if (userAchievements.isEmpty()) {
				userAchievements = achievementRepository.findByUserAndUnlockedTrue(user);
			}
			unlockedAchievementsCount = userAchievements.size();
			unlockedAchievementTitles = userAchievements.stream()
					.map(Achievement::getTitle)
					.filter(t -> t != null && !t.isBlank())
					.collect(Collectors.toList());
		} catch (Exception e) {
			// fallback
		}
		data.put("unlockedAchievementsCount", unlockedAchievementsCount);
		data.put("totalAchievementsCount", 12);
		data.put("unlockedAchievementTitles", unlockedAchievementTitles);

		// Distinct speaking scenarios completed (for Confident Conversationalist badge tracking)
		java.util.Set<String> distinctScenarios = sessions.stream()
				.filter(s -> Boolean.TRUE.equals(s.getCompleted()) || (s.getOverallScore() != null && s.getOverallScore() > 0))
				.map(s -> {
					String sc = s.getScenario();
					if (sc == null || sc.isBlank()) {
						sc = s.getTopic();
					}
					return sc != null ? sc.trim() : "";
				})
				.filter(s -> !s.isBlank())
				.collect(Collectors.toCollection(java.util.TreeSet::new));
		int distinctScenariosCount = distinctScenarios.size();
		int scenariosNeededForConfidentBadge = Math.max(0, 5 - distinctScenariosCount);

		data.put("distinctScenariosCount", distinctScenariosCount);
		data.put("distinctScenariosCompleted", new ArrayList<>(distinctScenarios));
		data.put("scenariosNeededForConfidentBadge", scenariosNeededForConfidentBadge);
		data.put("confidentConversationalistUnlocked", distinctScenariosCount >= 5);

		// AI Avatars and Speaking Scenarios catalog (100+ Scenarios Library across Age Groups & School Standards)
		data.put("availableAvatars", List.of(
				"Haru (Friendly English Tutor)",
				"Chitose (Casual Conversation)",
				"Robo-Paws (Interactive Mascot)",
				"Shizuku (Academic & Grammar Coach)",
				"Motu (Expressive Companion)"
		));
		data.put("availableScenarios", List.of(
				"Job Interview Practice (Career & Professional)",
				"Campus Coffee Shop (Young Adult)",
				"Show & Tell (Kids)",
				"First Day at High School (Teens)",
				"Business Meeting & Executive Coaching (Workplace)",
				"10th Board Oral Exam Simulation (High School 10th Std)",
				"Inter-School Debate & MUN Resolution (Middle School 8th Std)",
				"Science Project Idea Pitch (5th Std)",
				"Alphabet Phonics & Animal Friends (1st Std)",
				"Airport Customs & Hotel Check-in (Travel)",
				"Tea Time & Gardening (Senior)",
				"Salary & Contract Negotiation (Career)",
				"Public Speaking & Keynote Address (Advanced Oratory)"
		));
		data.put("totalAvailableScenarios", "100+ Interactive Scenarios (50 Age-Wise + 100 School Standard 1st–10th)");
		data.put("scenariosBreakdown", "50 Age-Wise Scenarios (Kids, Teens, Young Adult, Professional, Senior) and 100 Grade Scenarios (1st–10th Std)");
		data.put("ageWiseScenariosCount", 50);
		data.put("schoolStandardScenariosCount", 100);

		// Badges Roadmap & exact requirements
		Map<String, String> badgesRoadmap = new LinkedHashMap<>();
		badgesRoadmap.put("Confident Conversationalist", "Complete speaking sessions across 5 distinct conversation scenarios (e.g. Job Interview Practice, Campus Coffee Shop, Show & Tell, Airport Customs, Business Meeting) to unlock the Silver badge and earn 120 XP.");
		badgesRoadmap.put("Consistent Achiever", "Reach Level 5 strictly by earning 2,500 total XP through regular speaking and lesson practice.");
		badgesRoadmap.put("Streak Master", "Maintain a 7-day practice streak.");
		badgesRoadmap.put("Vocabulary Virtuoso", "Master 50 vocabulary words in the word bank.");
		badgesRoadmap.put("Grammar Guru", "Complete 25 grammar checks with 80%+ accuracy.");
		data.put("badgesRoadmap", badgesRoadmap);

		data.put("aiTutorCapabilities", List.of(
				"Grammar rules explanation & sentence structure correction",
				"Vocabulary definitions, synonyms, antonyms & contextual idioms",
				"Pronunciation guidance, phoneme drills & speaking fluency tips",
				"Real-world scenario dialogue & conversational roleplay",
				"Curriculum lessons review & school homework assistance",
				"XP milestone roadmaps & badge unlocking requirements"
		));

		// Homework & Assignments (Student role)
		int totalAssignedHomework = 0;
		int completedHomework = 0;
		int pendingHomework = 0;
		List<Map<String, Object>> pendingAssignmentsList = new ArrayList<>();
		if (user.getRole() == com.rslsolution.speakmateai.enums.Role.STUDENT || user.getSchoolId() != null) {
			try {
				List<AssignmentProgress> studentProgressList = assignmentProgressRepository.findByStudentId(user.getId());
				totalAssignedHomework = studentProgressList.size();
				for (AssignmentProgress ap : studentProgressList) {
					if ("COMPLETED".equalsIgnoreCase(ap.getStatus())) {
						completedHomework++;
					} else {
						pendingHomework++;
						if (ap.getAssignmentId() != null) {
							assignmentRepository.findById(ap.getAssignmentId()).ifPresent(a -> {
								Map<String, Object> aMap = new LinkedHashMap<>();
								aMap.put("title", a.getTitle());
								aMap.put("type", a.getType());
								aMap.put("dueDate", a.getDueDate() != null ? a.getDueDate().toString() : "No deadline");
								aMap.put("minimumScore", a.getMinimumScore() != null ? a.getMinimumScore() : 70);
								aMap.put("status", ap.getStatus());
								pendingAssignmentsList.add(aMap);
							});
						}
					}
				}
			} catch (Exception e) {
				// fallback
			}
			data.put("totalAssignedHomework", totalAssignedHomework);
			data.put("completedHomework", completedHomework);
			data.put("pendingHomework", pendingHomework);
			data.put("pendingAssignments", pendingAssignmentsList);
		}

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

		String std = user.getStandard();
		if (std == null || std.isBlank()) {
			std = user.getSchoolGrade();
		}
		String grade = user.getSchoolGrade();
		if (grade == null || grade.isBlank()) {
			grade = std;
		}
		if (std != null && !std.isBlank()) {
			data.put("standard", std);
		}
		if (grade != null && !grade.isBlank()) {
			data.put("schoolGrade", grade);
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
		if (user.getAgeGroup() != null && !user.getAgeGroup().isBlank()) {
			data.put("ageGroup", user.getAgeGroup());
		}

		if (teacherAssignmentResolver != null && (user.getRole() == com.rslsolution.speakmateai.enums.Role.STUDENT || user.getSchoolId() != null)) {
			try {
				List<Map<String, Object>> teachers = teacherAssignmentResolver.resolveAssignedTeachersForStudent(
						user.getId(), user.getSchoolId(), std, user.getDivision());
				if (teachers != null && !teachers.isEmpty()) {
					data.put("assignedTeachers", teachers);
					data.put("assignedTeacher", teachers.get(0).get("name"));
					if (teachers.get(0).get("subject") != null) {
						data.put("teacherSubject", teachers.get(0).get("subject"));
					}
				}
			} catch (Exception ignored) {
			}
		}

		data.put("dailyGoalMinutes", user.getDailyGoalMinutes() != null ? user.getDailyGoalMinutes() : 15);
		if (user.getLearningGoal() != null && !user.getLearningGoal().isBlank()) {
			data.put("learningGoal", user.getLearningGoal());
		}
		if (user.getEnglishLevel() != null && !user.getEnglishLevel().isBlank()) {
			data.put("englishLevel", user.getEnglishLevel());
		}

		int currentXp = p != null ? zeroIfNull(p.getXp()) : 0;
		int currentLevel = p != null ? Math.max(1, zeroIfNull(p.getLevel())) : 1;
		int nextLevel = currentLevel + 1;
		int nextLevelThreshold = currentLevel * 500;
		int xpRemaining = Math.max(0, nextLevelThreshold - currentXp);

		String englishLevelLabel;
		if (currentLevel <= 2) {
			englishLevelLabel = "Beginner";
		} else if (currentLevel <= 4) {
			englishLevelLabel = "Intermediate";
		} else {
			englishLevelLabel = "Advanced";
		}

		data.put("xp", currentXp);
		data.put("level", currentLevel);
		data.put("englishLevelLabel", englishLevelLabel);
		data.put("englishLevel", englishLevelLabel);
		data.put("proficiencyLevel", englishLevelLabel);
		data.put("nextLevel", nextLevel);
		data.put("nextLevelThreshold", nextLevelThreshold);
		data.put("xpRemaining", xpRemaining);
		int level5Threshold = 2500;
		int xpNeededForLevel5 = Math.max(0, level5Threshold - currentXp);
		boolean isLevel5Achieved = currentLevel >= 5;
		data.put("level5Threshold", level5Threshold);
		data.put("xpNeededForLevel5", xpNeededForLevel5);
		data.put("isLevel5Achieved", isLevel5Achieved);
		if (p != null) {
			data.put("currentStreak", zeroIfNull(p.getCurrentStreak()));
			data.put("longestStreak", zeroIfNull(p.getLongestStreak()));
			data.put("totalPracticeMinutes", zeroIfNull(p.getTotalPracticeMinutes()));
		} else {
			data.put("currentStreak", 0);
			data.put("longestStreak", 0);
			data.put("totalPracticeMinutes", 0);
		}

		data.put("totalSpeakingSessions", completedSessions);
		data.put("attemptedSpeakingSessions", totalSessions);
		data.put("completedSpeakingSessions", completedSessions);
		data.put("aiEvaluatedSpeakingSessions", scoredCount);
		data.put("evaluatedSpeakingSessions", scoredCount);
		data.put("totalVocabularyWords", totalVocabularyWords);
		data.put("wordsAdded", totalVocabularyWords);
		data.put("masteredVocabularyWords", masteredVocabularyWords);
		data.put("recentVocabularyWords", recentVocabWords);
		data.put("totalGrammarChecks", totalGrammarChecks);
		if (scoredGrammarCount > 0) {
			data.put("averageGrammarScore", avgGrammarScore);
		} else {
			data.put("averageGrammarScore", "Not yet evaluated");
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
		} else {
			data.put("fluencyScore", "Not yet evaluated");
			data.put("pronunciationScore", "Not yet evaluated");
			data.put("grammarScore", "Not yet evaluated");
			data.put("vocabularyScore", "Not yet evaluated");
			data.put("overallSpeakingScore", "Not yet evaluated");
		}

		boolean hasStarted = (lessonsCompleted > 0 || totalSessions > 0 || completedSessions > 0 || totalVocabularyWords > 0 || totalGrammarChecks > 0 || (p != null && p.getXp() != null && p.getXp() > 0));
		data.put("hasStartedLearning", hasStarted);
		data.put("isNewLearner", !hasStarted);
		data.put("starterGuidance", !hasStarted
				? "Brand new learner starting their learning path. Recommended next lesson: " + recommendedNextLesson
				: "Active learner with recorded progress.");

		data.put("appModules", List.of(
				"Speaking Practice (AI Voice & Roleplay Scenarios)",
				"AI Tutor (Live Interactive Avatars)",
				"Lessons (Curriculum-based reading, listening & exercises)",
				"Grammar Check (Instant sentence analysis & corrections)",
				"Vocabulary Builder (Word bank & flashcards)",
				"Assignments (School homework with minimum passing scores)",
				"Progress & Analytics (XP, level, streaks & score charts)",
				"Achievements (Milestone badges & rewards)",
				"Settings (Voice, accent, notifications & theme)",
				"Subscription (PRO plan upgrades & status)"
		));

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
		return false;
	}

	private boolean isValidOtherStudentIdentity(String requested) {
		if (requested == null || requested.isBlank()) {
			return false;
		}
		String req = requested.trim().toLowerCase(java.util.Locale.ROOT);
		if (req.equals("my") || req.equals("me") || req.equals("myself") || req.equals("self")
				|| req.equals("own") || req.equals("i")) {
			return false;
		}
		Set<String> domainTerms = Set.of(
				"achievement", "achievements", "word", "words", "fluency", "speaking", "lesson", "lessons",
				"xp", "level", "levels", "avatar", "avatars", "scenario", "scenarios", "grammar", "progress",
				"sentence", "sentences", "vocab", "vocabulary", "score", "scores", "streak", "streaks",
				"history", "check", "checks", "practice", "accuracy", "performance", "stat", "stats", "session", "sessions",
				"weak", "weakness", "weaknesses", "improve", "improvement", "improvements", "area", "areas", "spot", "spots", "gap", "gaps", "need", "work"
		);
		if (domainTerms.contains(req)) {
			return false;
		}

		if (req.contains("another student") || req.contains("other student") || req.contains("someone else")) {
			return true;
		}

		if (userRepository.findByEmailIgnoreCase(requested.trim()).isPresent()) {
			return true;
		}
		if (userRepository.existsStudentByStudentId(requested.trim())) {
			return true;
		}
		try {
			List<User> students = userRepository.findAllStudents();
			for (User s : students) {
				String first = s.getFirstName() != null ? s.getFirstName().trim().toLowerCase(java.util.Locale.ROOT) : "";
				String last = s.getLastName() != null ? s.getLastName().trim().toLowerCase(java.util.Locale.ROOT) : "";
				String full = (first + " " + last).trim();
				if (!full.isEmpty() && (full.equals(req) || req.equals(full) || first.equals(req))) {
					return true;
				}
				if (s.getEmail() != null && s.getEmail().equalsIgnoreCase(req)) {
					return true;
				}
			}
		} catch (Exception e) {
			// ignore
		}

		if (requested.trim().matches("^[A-Z][a-zA-Z]*(\\s+[A-Z][a-zA-Z]*)*$")) {
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
