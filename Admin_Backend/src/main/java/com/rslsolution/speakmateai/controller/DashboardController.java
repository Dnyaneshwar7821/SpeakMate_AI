package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.response.*;
import com.rslsolution.speakmateai.service.DashboardService;

@RestController
public class DashboardController {

	private final DashboardService dashboardService;

	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}

	@GetMapping({"/api/dashboard", "/api/dashboard/summary"})
	public DashboardSummaryResponse getDashboardSummary() {
		return dashboardService.getDashboardSummary();
	}

	@GetMapping("/api/dashboard/daily-goal")
	public DailyGoalResponse getDailyGoal() {
		return dashboardService.getDailyGoal();
	}

	@GetMapping("/api/dashboard/weekly-progress")
	public List<WeeklyProgressResponse> getWeeklyProgress() {
		return dashboardService.getWeeklyProgress();
	}

	@GetMapping("/api/dashboard/statistics")
	public StatisticsResponse getStatistics() {
		return dashboardService.getStatistics();
	}

	@GetMapping("/api/dashboard/quote")
	public QuoteResponse getQuote() {
		return dashboardService.getQuote();
	}

	@GetMapping("/api/activity/recent")
	public List<RecentActivityResponse> getRecentActivity() {
		return dashboardService.getRecentActivity();
	}

}
