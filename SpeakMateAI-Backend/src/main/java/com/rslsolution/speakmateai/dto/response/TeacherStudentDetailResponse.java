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
	private SpeakingSessionDetailResponse latestSpeakingSession;

	public ProfileResponse getProfile() { return profile; }
	public void setProfile(ProfileResponse profile) { this.profile = profile; }

	public PerformanceSummaryResponse getPerformance() { return performance; }
	public void setPerformance(PerformanceSummaryResponse performance) { this.performance = performance; }

	public List<RecentActivityResponse> getRecentActivity() { return recentActivity; }
	public void setRecentActivity(List<RecentActivityResponse> recentActivity) { this.recentActivity = recentActivity; }

	public List<StrengthImprovementResponse> getStrengths() { return strengths; }
	public void setStrengths(List<StrengthImprovementResponse> strengths) { this.strengths = strengths; }

	public List<StrengthImprovementResponse> getImprovementAreas() { return improvementAreas; }
	public void setImprovementAreas(List<StrengthImprovementResponse> improvementAreas) { this.improvementAreas = improvementAreas; }

	public List<AchievementResponse> getAchievements() { return achievements; }
	public void setAchievements(List<AchievementResponse> achievements) { this.achievements = achievements; }

	public PracticeStatisticsResponse getPracticeStatistics() { return practiceStatistics; }
	public void setPracticeStatistics(PracticeStatisticsResponse practiceStatistics) { this.practiceStatistics = practiceStatistics; }

	public List<WeeklyProgressResponse> getWeeklyCompletion() { return weeklyCompletion; }
	public void setWeeklyCompletion(List<WeeklyProgressResponse> weeklyCompletion) { this.weeklyCompletion = weeklyCompletion; }

	public Integer getCurrentStreak() { return currentStreak; }
	public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

	public LocalDateTime getLastPracticeDate() { return lastPracticeDate; }
	public void setLastPracticeDate(LocalDateTime lastPracticeDate) { this.lastPracticeDate = lastPracticeDate; }

	public String getStandard() { return standard; }
	public void setStandard(String standard) { this.standard = standard; }

	public String getDivision() { return division; }
	public void setDivision(String division) { this.division = division; }

	public String getRollNumber() { return rollNumber; }
	public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

	public String getSchoolName() { return schoolName; }
	public void setSchoolName(String schoolName) { this.schoolName = schoolName; }

	public Double getAttendanceRate() { return attendanceRate; }
	public void setAttendanceRate(Double attendanceRate) { this.attendanceRate = attendanceRate; }

	public SpeakingSessionDetailResponse getLatestSpeakingSession() { return latestSpeakingSession; }
	public void setLatestSpeakingSession(SpeakingSessionDetailResponse latestSpeakingSession) { this.latestSpeakingSession = latestSpeakingSession; }

	public static TeacherStudentDetailResponseBuilder builder() {
		return new TeacherStudentDetailResponseBuilder();
	}

	public static class TeacherStudentDetailResponseBuilder {
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
		private SpeakingSessionDetailResponse latestSpeakingSession;

		public TeacherStudentDetailResponseBuilder profile(ProfileResponse profile) { this.profile = profile; return this; }
		public TeacherStudentDetailResponseBuilder performance(PerformanceSummaryResponse performance) { this.performance = performance; return this; }
		public TeacherStudentDetailResponseBuilder recentActivity(List<RecentActivityResponse> recentActivity) { this.recentActivity = recentActivity; return this; }
		public TeacherStudentDetailResponseBuilder strengths(List<StrengthImprovementResponse> strengths) { this.strengths = strengths; return this; }
		public TeacherStudentDetailResponseBuilder improvementAreas(List<StrengthImprovementResponse> improvementAreas) { this.improvementAreas = improvementAreas; return this; }
		public TeacherStudentDetailResponseBuilder achievements(List<AchievementResponse> achievements) { this.achievements = achievements; return this; }
		public TeacherStudentDetailResponseBuilder practiceStatistics(PracticeStatisticsResponse practiceStatistics) { this.practiceStatistics = practiceStatistics; return this; }
		public TeacherStudentDetailResponseBuilder weeklyCompletion(List<WeeklyProgressResponse> weeklyCompletion) { this.weeklyCompletion = weeklyCompletion; return this; }
		public TeacherStudentDetailResponseBuilder currentStreak(Integer currentStreak) { this.currentStreak = currentStreak; return this; }
		public TeacherStudentDetailResponseBuilder lastPracticeDate(LocalDateTime lastPracticeDate) { this.lastPracticeDate = lastPracticeDate; return this; }
		public TeacherStudentDetailResponseBuilder standard(String standard) { this.standard = standard; return this; }
		public TeacherStudentDetailResponseBuilder division(String division) { this.division = division; return this; }
		public TeacherStudentDetailResponseBuilder rollNumber(String rollNumber) { this.rollNumber = rollNumber; return this; }
		public TeacherStudentDetailResponseBuilder schoolName(String schoolName) { this.schoolName = schoolName; return this; }
		public TeacherStudentDetailResponseBuilder attendanceRate(Double attendanceRate) { this.attendanceRate = attendanceRate; return this; }
		public TeacherStudentDetailResponseBuilder latestSpeakingSession(SpeakingSessionDetailResponse latestSpeakingSession) { this.latestSpeakingSession = latestSpeakingSession; return this; }

		public TeacherStudentDetailResponse build() {
			TeacherStudentDetailResponse obj = new TeacherStudentDetailResponse();
			obj.setProfile(profile);
			obj.setPerformance(performance);
			obj.setRecentActivity(recentActivity);
			obj.setStrengths(strengths);
			obj.setImprovementAreas(improvementAreas);
			obj.setAchievements(achievements);
			obj.setPracticeStatistics(practiceStatistics);
			obj.setWeeklyCompletion(weeklyCompletion);
			obj.setCurrentStreak(currentStreak);
			obj.setLastPracticeDate(lastPracticeDate);
			obj.setStandard(standard);
			obj.setDivision(division);
			obj.setRollNumber(rollNumber);
			obj.setSchoolName(schoolName);
			obj.setAttendanceRate(attendanceRate);
			obj.setLatestSpeakingSession(latestSpeakingSession);
			return obj;
		}
	}
}
