package com.rslsolution.speakmateai.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

	private String rank;
	private ProfileResponse profile;
	private ProgressResponse progress;
	private DailyGoalResponse dailyGoal;
	private List<WeeklyProgressResponse> weeklyProgress;
	private StatisticsResponse statistics;
	private QuoteResponse quote;
	private List<RecentActivityResponse> recentActivity;
	private List<LessonResponse> activeLessons;
	private List<LessonResponse> upcomingLessons;
	private Integer unreadNotificationsCount;
	private ContinueLearningResponse continueLearning;
	private WordOfTheDayResponse wordOfTheDay;
	private String englishTip;
	private List<RecommendationResponse> recommendations;
	private List<AchievementResponse> achievements;
	private List<NotificationResponse> notifications;

}

