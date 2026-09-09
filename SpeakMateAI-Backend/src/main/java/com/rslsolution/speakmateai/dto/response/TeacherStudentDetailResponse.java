package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherStudentDetailResponse {
	private ProfileResponse profile;
	private PerformanceSummaryResponse performance;
	private List<RecentActivityResponse> recentActivity;
	private List<StrengthImprovementResponse> strengths;
	private List<StrengthImprovementResponse> improvementAreas;
	private List<AchievementResponse> achievements;
	private PracticeStatisticsResponse practiceStatistics;
	private List<WeeklyProgressResponse> weeklyCompletion;
	private Integer currentStreak;
	private LocalDateTime lastPracticeDate;
	private String standard;
	private String division;
	private String rollNumber;
	private String schoolName;
	private Double attendanceRate;
}
