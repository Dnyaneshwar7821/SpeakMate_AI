package com.rslsolution.speakmateai.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.response.*;
import com.rslsolution.speakmateai.entity.*;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.*;
import com.rslsolution.speakmateai.service.DashboardService;

@Service
@Transactional
public class DashboardServiceImpl implements DashboardService {

	private final UserRepository userRepository;
	private final ProgressRepository progressRepository;
	private final OnboardingRepository onboardingRepository;
	private final SpeakingSessionRepository speakingSessionRepository;
	private final VocabularyRepository vocabularyRepository;
	private final GrammarHistoryRepository grammarHistoryRepository;
	private final ChatHistoryRepository chatHistoryRepository;
	private final LessonRepository lessonRepository;
	private final LessonProgressRepository lessonProgressRepository;
	private final AchievementRepository achievementRepository;
	private final NotificationRepository notificationRepository;
	private final ChatSessionRepository chatSessionRepository;

	public DashboardServiceImpl(
			UserRepository userRepository,
			ProgressRepository progressRepository,
			OnboardingRepository onboardingRepository,
			SpeakingSessionRepository speakingSessionRepository,
			VocabularyRepository vocabularyRepository,
			GrammarHistoryRepository grammarHistoryRepository,
			ChatHistoryRepository chatHistoryRepository,
			LessonRepository lessonRepository,
			LessonProgressRepository lessonProgressRepository,
			AchievementRepository achievementRepository,
			NotificationRepository notificationRepository,
			ChatSessionRepository chatSessionRepository) {
		this.userRepository = userRepository;
		this.progressRepository = progressRepository;
		this.onboardingRepository = onboardingRepository;
		this.speakingSessionRepository = speakingSessionRepository;
		this.vocabularyRepository = vocabularyRepository;
		this.grammarHistoryRepository = grammarHistoryRepository;
		this.chatHistoryRepository = chatHistoryRepository;
		this.lessonRepository = lessonRepository;
		this.lessonProgressRepository = lessonProgressRepository;
		this.achievementRepository = achievementRepository;
		this.notificationRepository = notificationRepository;
		this.chatSessionRepository = chatSessionRepository;
	}

	private User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));
	}

	private LessonResponse mapToLessonResponse(Lesson l, LessonProgress p) {
		LessonResponse.LessonResponseBuilder b = LessonResponse.builder()
				.id(l.getId())
				.title(l.getTitle())
				.category(l.getCategory())
				.level(l.getLevel())
				.description(l.getDescription())
				.content(l.getContent())
				.duration(l.getDuration())
				.active(l.getActive())
				.createdAt(l.getCreatedAt())
				.updatedAt(l.getUpdatedAt())
				.xpReward(l.getXpReward())
				.thumbnail(l.getThumbnail())
				.coverImage(l.getCoverImage())
				.locked(l.getLocked())
				.requiredXP(l.getRequiredXP())
				.requiredLevel(l.getRequiredLevel())
				.estimatedMinutes(l.getEstimatedMinutes())
				.orderIndex(l.getOrderIndex())
				.skills(l.getSkills())
				.objectives(l.getObjectives())
				.requirements(l.getRequirements())
				.popular(l.getPopular())
				.featured(l.getFeatured());

		if (p != null) {
			b.progressPercent(p.getProgressPercent())
					.completed(p.getCompleted())
					.lastSectionIndex(p.getLastSectionIndex())
					.xpEarned(p.getXpEarned())
					.lastOpenedAt(p.getLastOpenedAt())
					.completedAt(p.getCompletedAt());
		} else {
			b.progressPercent(0).completed(false).lastSectionIndex(0).xpEarned(0);
		}
		return b.build();
	}

	@Override
	public DashboardSummaryResponse getDashboardSummary() {
		User user = getCurrentUser();
		Progress progress = progressRepository.findByUser(user).orElse(null);
		int xp = (progress != null) ? progress.getXp() : 0;
		String rank;
		if (xp < 100) rank = "Bronze III";
		else if (xp < 300) rank = "Bronze II";
		else if (xp < 600) rank = "Bronze I";
		else if (xp < 1000) rank = "Silver III";
		else if (xp < 1500) rank = "Silver II";
		else if (xp < 2100) rank = "Silver I";
		else rank = "Gold I";

		// 1. ProfileResponse
		ProfileResponse profileRes = ProfileResponse.builder()
				.id(user.getId())
				.firstName(user.getFirstName())
				.lastName(user.getLastName())
				.email(user.getEmail())
				.role(user.getRole().name())
				.avatar(user.getAvatar())
				.build();

		// 2. ProgressResponse
		ProgressResponse progressRes = null;
		if (progress != null) {
			int calculatedLevel = (xp / 500) + 1;
			if (progress.getLevel() == null || progress.getLevel() != calculatedLevel) {
				progress.setLevel(calculatedLevel);
				progressRepository.save(progress);
			}

			progressRes = ProgressResponse.builder()
					.id(progress.getId())
					.xp(xp)
					.level(calculatedLevel)
					.currentStreak(progress.getCurrentStreak())
					.longestStreak(progress.getLongestStreak())
					.totalPracticeMinutes(progress.getTotalPracticeMinutes())
					.totalSpeakingSessions(progress.getTotalSpeakingSessions())
					.totalGrammarChecks(progress.getTotalGrammarChecks())
					.totalVocabularyWords(progress.getTotalVocabularyWords())
					.createdAt(progress.getCreatedAt())
					.updatedAt(progress.getUpdatedAt())
					.build();
		} else {
			progressRes = ProgressResponse.builder()
					.xp(0)
					.level(1)
					.currentStreak(0)
					.longestStreak(0)
					.totalPracticeMinutes(0)
					.totalSpeakingSessions(0)
					.totalGrammarChecks(0)
					.totalVocabularyWords(0)
					.build();
		}

		// 3. DailyGoalResponse
		DailyGoalResponse dailyGoalRes = getDailyGoal();

		// 4. WeeklyProgressResponse
		List<WeeklyProgressResponse> weeklyProgressRes = getWeeklyProgress();

		// 5. StatisticsResponse
		StatisticsResponse statisticsRes = getStatistics();

		// 6. QuoteResponse
		QuoteResponse quoteRes = getQuote();

		// 7. RecentActivityResponse
		List<RecentActivityResponse> recentActivityRes = getRecentActivity();

		// 8. Active and Upcoming Lessons
		List<LessonProgress> userProgressList = lessonProgressRepository.findByUser(user);
		Map<Long, LessonProgress> progressMap = userProgressList.stream()
				.collect(Collectors.toMap(p -> p.getLesson().getId(), p -> p, (a, b) -> a));

		List<Lesson> activeLessonsList = lessonRepository.findByActiveTrue();
		List<LessonResponse> activeLessonsRes = activeLessonsList.stream()
				.map(l -> mapToLessonResponse(l, progressMap.get(l.getId())))
				.toList();

		List<LessonResponse> upcomingLessonsRes = activeLessonsList.size() <= 1
				? activeLessonsList.stream().map(l -> mapToLessonResponse(l, progressMap.get(l.getId()))).toList()
				: activeLessonsList.stream().skip(1).map(l -> mapToLessonResponse(l, progressMap.get(l.getId()))).toList();

		// 9. Notifications (latest unread notifications)
		List<Notification> unreadNotificationsList = notificationRepository.findByUserAndIsReadFalse(user);
		unreadNotificationsList.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
		Integer unreadCount = unreadNotificationsList.size();

		List<NotificationResponse> notificationResList = unreadNotificationsList.stream()
				.map(n -> NotificationResponse.builder()
						.id(n.getId())
						.title(n.getTitle())
						.message(n.getMessage())
						.isRead(n.getIsRead())
						.createdAt(n.getCreatedAt())
						.build())
				.limit(5)
				.toList();

		// 10. Achievements (latest unlocked achievements)
		List<Achievement> unlockedAchievements = achievementRepository.findByUserAndUnlockedTrue(user);
		unlockedAchievements.sort((a, b) -> {
			LocalDateTime aTime = a.getUnlockedAt() != null ? a.getUnlockedAt() : a.getCreatedAt();
			LocalDateTime bTime = b.getUnlockedAt() != null ? b.getUnlockedAt() : b.getCreatedAt();
			return bTime.compareTo(aTime);
		});
		List<AchievementResponse> achievementsRes = unlockedAchievements.stream()
				.map(a -> AchievementResponse.builder()
						.id(a.getId())
						.title(a.getTitle())
						.description(a.getDescription())
						.xpReward(a.getXpReward())
						.tier(a.getTier() != null ? a.getTier() : 1)
						.unlocked(a.getUnlocked())
						.unlockedAt(a.getUnlockedAt())
						.createdAt(a.getCreatedAt())
						.build())
				.limit(3)
				.toList();

		// 11. ContinueLearningResponse (Priority check)
		ContinueLearningResponse continueLearning = null;

		// Priority 1: Speaking Session in progress
		List<SpeakingSession> sessionsList = speakingSessionRepository.findByUserOrderByCreatedAtDesc(user);
		SpeakingSession activeSession = sessionsList.stream()
				.filter(s -> s.getOverallScore() == null || s.getOverallScore() == 0.0 || s.getDuration() == 0)
				.findFirst()
				.orElse(null);

		if (activeSession != null) {
			int count = activeSession.getMessages() != null ? activeSession.getMessages().size() : 0;
			int progressPercent = Math.min(90, count * 15);
			continueLearning = ContinueLearningResponse.builder()
					.module("Speaking Session")
					.title(activeSession.getTopic())
					.progressPercent(progressPercent)
					.estimatedMinutesRemaining(Math.max(1, 5 - (activeSession.getDuration() / 60)))
					.targetId(activeSession.getId())
					.build();
		}

		// Priority 2: Lesson in progress
		if (continueLearning == null) {
			List<LessonProgress> inProgressLessons = userProgressList.stream()
					.filter(p -> !Boolean.TRUE.equals(p.getCompleted()) && p.getProgressPercent() > 0 && p.getProgressPercent() < 100)
					.sorted((a, b) -> b.getLastOpenedAt().compareTo(a.getLastOpenedAt()))
					.toList();

			if (!inProgressLessons.isEmpty()) {
				LessonProgress lp = inProgressLessons.get(0);
				int est = lp.getLesson().getEstimatedMinutes() != null ? lp.getLesson().getEstimatedMinutes() : 10;
				continueLearning = ContinueLearningResponse.builder()
						.module("Lesson")
						.title(lp.getLesson().getTitle())
						.progressPercent(lp.getProgressPercent())
						.estimatedMinutesRemaining(Math.max(1, (int) Math.round((100 - lp.getProgressPercent()) / 100.0 * est)))
						.targetId(lp.getLesson().getId())
						.build();
			}
		}

		// Priority 3: Vocabulary Quiz (if they have vocabulary words)
		if (continueLearning == null) {
			List<Vocabulary> vocabs = vocabularyRepository.findByUser(user);
			if (!vocabs.isEmpty()) {
				continueLearning = ContinueLearningResponse.builder()
						.module("Vocabulary Quiz")
						.title("Review Saved Words (" + vocabs.size() + " words)")
						.progressPercent(0)
						.estimatedMinutesRemaining(3)
						.targetId(null)
						.build();
			}
		}

		// Priority 4: Grammar Exercise (if they have grammar check history)
		if (continueLearning == null) {
			List<GrammarHistory> grammars = grammarHistoryRepository.findByUser(user);
			if (!grammars.isEmpty()) {
				continueLearning = ContinueLearningResponse.builder()
						.module("Grammar Exercise")
						.title("Review Grammar Corrections")
						.progressPercent(0)
						.estimatedMinutesRemaining(4)
						.targetId(null)
						.build();
			}
		}

		// Priority 5: AI Chat in progress
		if (continueLearning == null) {
			List<ChatSession> chatSessions = chatSessionRepository.findByUserOrderByUpdatedAtDesc(user);
			if (!chatSessions.isEmpty()) {
				ChatSession latestChat = chatSessions.get(0);
				continueLearning = ContinueLearningResponse.builder()
						.module("AI Chat")
						.title(latestChat.getTitle() != null ? latestChat.getTitle() : "AI Conversation")
						.progressPercent(50)
						.estimatedMinutesRemaining(5)
						.targetId(latestChat.getId())
						.build();
			}
		}

		// 12. Recommendations (Dynamic personalized recommendations)
		List<RecommendationResponse> recommendationsList = new ArrayList<>();
		Lesson uncompletedLesson = activeLessonsList.stream()
				.filter(l -> {
					LessonProgress p = progressMap.get(l.getId());
					return p != null && !Boolean.TRUE.equals(p.getCompleted());
				})
				.findFirst()
				.orElse(null);

		if (uncompletedLesson != null) {
			recommendationsList.add(RecommendationResponse.builder()
					.type("lesson")
					.title("Resume: " + uncompletedLesson.getTitle())
					.actionLabel("Resume")
					.targetId(uncompletedLesson.getId())
					.build());
		} else if (!activeLessonsList.isEmpty()) {
			recommendationsList.add(RecommendationResponse.builder()
					.type("lesson")
					.title("Start: " + activeLessonsList.get(0).getTitle())
					.actionLabel("Start")
					.targetId(activeLessonsList.get(0).getId())
					.build());
		}

		recommendationsList.add(RecommendationResponse.builder()
				.type("speaking")
				.title("Practice: Restaurant Conversation")
				.actionLabel("Practice")
				.targetId(null)
				.build());

		recommendationsList.add(RecommendationResponse.builder()
				.type("vocabulary")
				.title("Review Saved Vocabulary Words")
				.actionLabel("Review")
				.targetId(null)
				.build());

		recommendationsList.add(RecommendationResponse.builder()
				.type("grammar")
				.title("Complete a Grammar Quiz")
				.actionLabel("Check")
				.targetId(null)
				.build());

		recommendationsList.add(RecommendationResponse.builder()
				.type("chat")
				.title("Continue AI Tutor Conversation")
				.actionLabel("Chat")
				.targetId(null)
				.build());

		// 13. Word Of The Day
		String[][] words = {
				{"Eloquent", "fluent or persuasive in speaking or writing.", "His eloquent speech moved the audience.", "Expressive", "Inarticulate"},
				{"Articulate", "having or showing the ability to speak fluently and coherently.", "She is highly articulate and expresses her ideas well.", "Fluent", "Unclear"},
				{"Resilient", "able to withstand or recover quickly from difficult conditions.", "English learners must be resilient when making mistakes.", "Strong", "Weak"},
				{"Meticulous", "showing great attention to detail; very careful and precise.", "He kept a meticulous record of his vocabulary.", "Detailed", "Careless"},
				{"Cognizant", "having knowledge or being aware of.", "Be cognizant of your pronunciation when speaking.", "Aware", "Ignorant"},
				{"Pragmatic", "dealing with things sensibly and realistically.", "A pragmatic approach to learning is practicing every day.", "Practical", "Idealistic"},
				{"Ubiquitous", "present, appearing, or found everywhere.", "English is a ubiquitous language in global business.", "Omnipresent", "Rare"}
		};
		int wIndex = (int) (LocalDate.now().toEpochDay() % words.length);
		WordOfTheDayResponse wordOfTheDayRes = WordOfTheDayResponse.builder()
				.word(words[wIndex][0])
				.meaning(words[wIndex][1])
				.exampleSentence(words[wIndex][2])
				.synonym(words[wIndex][3])
				.antonym(words[wIndex][4])
				.build();

		// 14. English Tip of the Day
		String[] tips = {
				"Try reading news articles aloud to improve your speech rhythm and fluency.",
				"Record your voice while speaking and play it back to identify pronunciation errors.",
				"Learn words in collocations (word groups) instead of single list items.",
				"Think in English for 5 minutes daily to reduce translation hesitation.",
				"Watch movies with English subtitles to match listening with written spelling.",
				"Use active recall - quiz yourself on yesterday's words before learning new ones.",
				"Don't fear making mistakes; they are the best indicators of progress."
		};
		int tIndex = (int) (LocalDate.now().toEpochDay() % tips.length);
		String englishTipRes = tips[tIndex];

		// Return fully aggregated DashboardSummaryResponse
		return DashboardSummaryResponse.builder()
				.rank(rank)
				.profile(profileRes)
				.progress(progressRes)
				.dailyGoal(dailyGoalRes)
				.weeklyProgress(weeklyProgressRes)
				.statistics(statisticsRes)
				.quote(quoteRes)
				.recentActivity(recentActivityRes)
				.activeLessons(activeLessonsRes)
				.upcomingLessons(upcomingLessonsRes)
				.unreadNotificationsCount(unreadCount)
				.continueLearning(continueLearning)
				.wordOfTheDay(wordOfTheDayRes)
				.englishTip(englishTipRes)
				.recommendations(recommendationsList)
				.achievements(achievementsRes)
				.notifications(notificationResList)
				.build();
	}

	@Override
	public DailyGoalResponse getDailyGoal() {
		User user = getCurrentUser();
		List<SpeakingSession> sessions = speakingSessionRepository.findByUser(user);
		List<Vocabulary> vocabs = vocabularyRepository.findByUser(user);
		Onboarding onboarding = onboardingRepository.findByUser(user).orElse(null);

		LocalDate today = LocalDate.now();

		List<SpeakingSession> todaySessions = sessions.stream()
				.filter(s -> s.getCreatedAt() != null && s.getCreatedAt().toLocalDate().isEqual(today))
				.toList();

		int totalSecondsToday = todaySessions.stream().mapToInt(s -> s.getDuration() != null ? s.getDuration() : 0).sum();
		int speakingMinutesToday = (int) Math.ceil(totalSecondsToday / 60.0);
		int lessonsCompletedToday = todaySessions.isEmpty() ? 0 : 1;

		long vocabularyCompleted = vocabs.stream()
				.filter(v -> v.getCreatedAt() != null && v.getCreatedAt().toLocalDate().isEqual(today))
				.count();

		int dailyGoalMinutes = (onboarding != null && onboarding.getDailyGoalMinutes() != null)
				? onboarding.getDailyGoalMinutes()
				: 15;

		double minutesScore = dailyGoalMinutes > 0 ? (double) speakingMinutesToday / dailyGoalMinutes : 0;
		double vocabScore = 5.0 > 0 ? (double) vocabularyCompleted / 5.0 : 0;
		double lessonScore = lessonsCompletedToday > 0 ? 1.0 : 0.0;
		double percentage = Math.max(0.0, Math.min(100.0, ((minutesScore + vocabScore + lessonScore) / 3.0) * 100.0));

		int remainingLessons = Math.max(0, 1 - lessonsCompletedToday);

		return DailyGoalResponse.builder()
				.title("Today Practice Goal")
				.lessonsCompletedToday(lessonsCompletedToday)
				.speakingMinutesToday(speakingMinutesToday)
				.vocabularyCompleted((int) vocabularyCompleted)
				.vocabularyTarget(5)
				.percentage(percentage)
				.remainingLessons(remainingLessons)
				.build();
	}

	@Override
	public List<WeeklyProgressResponse> getWeeklyProgress() {
		User user = getCurrentUser();
		String[] dayNames = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
		List<WeeklyProgressResponse> weeklyProgress = new ArrayList<>();
		for (String dayName : dayNames) {
			weeklyProgress.add(WeeklyProgressResponse.builder()
					.day(dayName)
					.studyMinutes(0)
					.lessonsCompleted(0)
					.speakingSessions(0)
					.build());
		}

		LocalDate today = LocalDate.now();
		LocalDate monday = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
		LocalDate sunday = monday.plusDays(6);

		List<SpeakingSession> sessions = speakingSessionRepository.findByUser(user);
		int[] studySeconds = new int[7];
		int[] speakingSessions = new int[7];
		int[] lessonsCompleted = new int[7];

		for (SpeakingSession s : sessions) {
			if (s.getCreatedAt() != null) {
				LocalDate date = s.getCreatedAt().toLocalDate();
				if (!date.isBefore(monday) && !date.isAfter(sunday)) {
					int dayOfWeekIndex = date.getDayOfWeek().getValue() - 1; // Mon=1 -> 0, Sun=7 -> 6
					studySeconds[dayOfWeekIndex] += s.getDuration() != null ? s.getDuration() : 0;
					speakingSessions[dayOfWeekIndex]++;
					lessonsCompleted[dayOfWeekIndex] = 1;
				}
			}
		}

		for (int i = 0; i < 7; i++) {
			WeeklyProgressResponse dayRes = weeklyProgress.get(i);
			dayRes.setStudyMinutes((int) Math.ceil(studySeconds[i] / 60.0));
			dayRes.setSpeakingSessions(speakingSessions[i]);
			dayRes.setLessonsCompleted(lessonsCompleted[i]);
		}

		return weeklyProgress;
	}

	@Override
	public StatisticsResponse getStatistics() {
		User user = getCurrentUser();
		List<SpeakingSession> sessions = speakingSessionRepository.findByUser(user);
		List<Vocabulary> vocabs = vocabularyRepository.findByUser(user);
		List<GrammarHistory> grammars = grammarHistoryRepository.findByUser(user);
		Progress progress = progressRepository.findByUser(user).orElse(null);
		List<Lesson> lessons = lessonRepository.findByActiveTrue();

		int totalLessons = lessons.size();
		int xp = (progress != null) ? progress.getXp() : 0;
		int completedLessons = xp / 100;
		int speakingSessions = sessions.size();
		int vocabularyLearned = vocabs.size();
		int grammarExercises = grammars.size();

		int totalPracticeSeconds = sessions.stream().mapToInt(s -> s.getDuration() != null ? s.getDuration() : 0).sum();
		double totalStudyHours = Math.round((totalPracticeSeconds / 3600.0) * 10.0) / 10.0;

		int currentStreak = (progress != null) ? progress.getCurrentStreak() : 0;
		int longestStreak = (progress != null) ? progress.getLongestStreak() : 0;

		double avgScoreSum = sessions.stream()
				.filter(s -> s.getOverallScore() != null)
				.mapToDouble(SpeakingSession::getOverallScore)
				.average()
				.orElse(0.0);
		int averageScore = (int) Math.round(avgScoreSum);

		return StatisticsResponse.builder()
				.totalLessons(totalLessons)
				.completedLessons(completedLessons)
				.speakingSessions(speakingSessions)
				.vocabularyLearned(vocabularyLearned)
				.grammarExercises(grammarExercises)
				.totalStudyHours(totalStudyHours)
				.currentStreak(currentStreak)
				.longestStreak(longestStreak)
				.averageScore(averageScore)
				.build();
	}

	@Override
	public QuoteResponse getQuote() {
		String[][] quotes = {
				{"The secret of getting ahead is getting started.", "Mark Twain"},
				{"Practice is the quiet bridge between wanting and becoming.", "SpeakMateAI"},
				{"Small steps every day become confident conversations.", "SpeakMateAI"},
				{"Learning never exhausts the mind when it has purpose.", "Leonardo da Vinci"},
				{"One more sentence today is one more door tomorrow.", "SpeakMateAI"},
				{"Confidence grows when effort becomes a habit.", "SpeakMateAI"},
				{"Start where you are. Speak what you can. Improve what comes next.", "SpeakMateAI"}
		};
		int dayIndex = (int) (LocalDate.now().toEpochDay() % quotes.length);
		return QuoteResponse.builder()
				.text(quotes[dayIndex][0])
				.author(quotes[dayIndex][1])
				.build();
	}

	@Override
	public List<RecentActivityResponse> getRecentActivity() {
		User user = getCurrentUser();
		List<RecentActivityResponse> activities = new ArrayList<>();

		List<SpeakingSession> sessions = speakingSessionRepository.findByUserOrderByCreatedAtDesc(user);
		for (SpeakingSession s : sessions) {
			activities.add(RecentActivityResponse.builder()
					.id("speaking-" + s.getId())
					.type("speaking")
					.icon("mic")
					.title(s.getTopic() != null ? "Speaking Session: " + s.getTopic() : "Speaking Session")
					.time(s.getCreatedAt())
					.xp(15)
					.build());
		}

		List<Vocabulary> vocabs = vocabularyRepository.findByUserOrderByCreatedAtDesc(user);
		for (Vocabulary v : vocabs) {
			activities.add(RecentActivityResponse.builder()
					.id("vocabulary-" + v.getId())
					.type("vocabulary")
					.icon("library")
					.title(v.getWord() != null ? "Vocabulary Practice: " + v.getWord() : "Vocabulary Practice")
					.time(v.getCreatedAt())
					.xp(8)
					.build());
		}

		List<GrammarHistory> grammars = grammarHistoryRepository.findByUserOrderByCreatedAtDesc(user);
		for (GrammarHistory g : grammars) {
			activities.add(RecentActivityResponse.builder()
					.id("grammar-" + g.getId())
					.type("grammar")
					.icon("text")
					.title("Grammar Practice")
					.time(g.getCreatedAt())
					.xp(10)
					.build());
		}

		List<ChatHistory> chats = chatHistoryRepository.findByUser(user);
		for (ChatHistory c : chats) {
			activities.add(RecentActivityResponse.builder()
					.id("chat-" + c.getId())
					.type("chat")
					.icon("chatbubbles")
					.title("AI Conversation")
					.time(c.getCreatedAt())
					.xp(6)
					.build());
		}

		activities.sort((a, b) -> b.getTime().compareTo(a.getTime()));

		if (activities.size() > 10) {
			return activities.subList(0, 10);
		}
		return activities;
	}

}
