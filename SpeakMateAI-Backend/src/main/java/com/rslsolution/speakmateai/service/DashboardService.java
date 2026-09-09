package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.response.*;

public interface DashboardService {

	DashboardSummaryResponse getDashboardSummary();

	DailyGoalResponse getDailyGoal();

	List<WeeklyProgressResponse> getWeeklyProgress();

	StatisticsResponse getStatistics();

	QuoteResponse getQuote();

	List<RecentActivityResponse> getRecentActivity();

}
