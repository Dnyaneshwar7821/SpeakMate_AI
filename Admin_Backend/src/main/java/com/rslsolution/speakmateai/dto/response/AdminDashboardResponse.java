package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

	private Long totalUsers;

	private Long activeUsers;

	private Long inactiveUsers;

	private Long schoolUsers;

	private Long totalSchools;

	private Long newUsers;

	private Long thisMonthRegistrations;

	private Long thisWeekRegistrations;

	private Long todayRegistrations;

	private Long totalLessons;

	private Long activeLessons;

	private Long totalSpeakingSessions;

	private Long totalVocabularyWords;

	private Long totalAchievements;

	private Long totalNotifications;

	public Long getTotalUsers() { return totalUsers; }
	public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

	public Long getActiveUsers() { return activeUsers; }
	public void setActiveUsers(Long activeUsers) { this.activeUsers = activeUsers; }

	public Long getInactiveUsers() { return inactiveUsers; }
	public void setInactiveUsers(Long inactiveUsers) { this.inactiveUsers = inactiveUsers; }

	public Long getSchoolUsers() { return schoolUsers; }
	public void setSchoolUsers(Long schoolUsers) { this.schoolUsers = schoolUsers; }

	public Long getTotalSchools() { return totalSchools; }
	public void setTotalSchools(Long totalSchools) { this.totalSchools = totalSchools; }

	public Long getNewUsers() { return newUsers; }
	public void setNewUsers(Long newUsers) { this.newUsers = newUsers; }

	public Long getThisMonthRegistrations() { return thisMonthRegistrations; }
	public void setThisMonthRegistrations(Long thisMonthRegistrations) { this.thisMonthRegistrations = thisMonthRegistrations; }

	public Long getThisWeekRegistrations() { return thisWeekRegistrations; }
	public void setThisWeekRegistrations(Long thisWeekRegistrations) { this.thisWeekRegistrations = thisWeekRegistrations; }

	public Long getTodayRegistrations() { return todayRegistrations; }
	public void setTodayRegistrations(Long todayRegistrations) { this.todayRegistrations = todayRegistrations; }

	public Long getTotalLessons() { return totalLessons; }
	public void setTotalLessons(Long totalLessons) { this.totalLessons = totalLessons; }

	public Long getActiveLessons() { return activeLessons; }
	public void setActiveLessons(Long activeLessons) { this.activeLessons = activeLessons; }

	public Long getTotalSpeakingSessions() { return totalSpeakingSessions; }
	public void setTotalSpeakingSessions(Long totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; }

	public Long getTotalVocabularyWords() { return totalVocabularyWords; }
	public void setTotalVocabularyWords(Long totalVocabularyWords) { this.totalVocabularyWords = totalVocabularyWords; }

	public Long getTotalAchievements() { return totalAchievements; }
	public void setTotalAchievements(Long totalAchievements) { this.totalAchievements = totalAchievements; }

	public Long getTotalNotifications() { return totalNotifications; }
	public void setTotalNotifications(Long totalNotifications) { this.totalNotifications = totalNotifications; }

	public static AdminDashboardResponseBuilder builder() {
		return new AdminDashboardResponseBuilder();
	}

	public static class AdminDashboardResponseBuilder {
		private Long totalUsers;
		private Long activeUsers;
		private Long inactiveUsers;
		private Long schoolUsers;
		private Long totalSchools;
		private Long newUsers;
		private Long thisMonthRegistrations;
		private Long thisWeekRegistrations;
		private Long todayRegistrations;
		private Long totalLessons;
		private Long activeLessons;
		private Long totalSpeakingSessions;
		private Long totalVocabularyWords;
		private Long totalAchievements;
		private Long totalNotifications;

		public AdminDashboardResponseBuilder totalUsers(Long totalUsers) { this.totalUsers = totalUsers; return this; }
		public AdminDashboardResponseBuilder activeUsers(Long activeUsers) { this.activeUsers = activeUsers; return this; }
		public AdminDashboardResponseBuilder inactiveUsers(Long inactiveUsers) { this.inactiveUsers = inactiveUsers; return this; }
		public AdminDashboardResponseBuilder schoolUsers(Long schoolUsers) { this.schoolUsers = schoolUsers; return this; }
		public AdminDashboardResponseBuilder totalSchools(Long totalSchools) { this.totalSchools = totalSchools; return this; }
		public AdminDashboardResponseBuilder newUsers(Long newUsers) { this.newUsers = newUsers; return this; }
		public AdminDashboardResponseBuilder thisMonthRegistrations(Long thisMonthRegistrations) { this.thisMonthRegistrations = thisMonthRegistrations; return this; }
		public AdminDashboardResponseBuilder thisWeekRegistrations(Long thisWeekRegistrations) { this.thisWeekRegistrations = thisWeekRegistrations; return this; }
		public AdminDashboardResponseBuilder todayRegistrations(Long todayRegistrations) { this.todayRegistrations = todayRegistrations; return this; }
		public AdminDashboardResponseBuilder totalLessons(Long totalLessons) { this.totalLessons = totalLessons; return this; }
		public AdminDashboardResponseBuilder activeLessons(Long activeLessons) { this.activeLessons = activeLessons; return this; }
		public AdminDashboardResponseBuilder totalSpeakingSessions(Long totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; return this; }
		public AdminDashboardResponseBuilder totalVocabularyWords(Long totalVocabularyWords) { this.totalVocabularyWords = totalVocabularyWords; return this; }
		public AdminDashboardResponseBuilder totalAchievements(Long totalAchievements) { this.totalAchievements = totalAchievements; return this; }
		public AdminDashboardResponseBuilder totalNotifications(Long totalNotifications) { this.totalNotifications = totalNotifications; return this; }

		public AdminDashboardResponse build() {
            AdminDashboardResponse obj = new AdminDashboardResponse();
            obj.setTotalUsers(totalUsers);
            obj.setActiveUsers(activeUsers);
            obj.setInactiveUsers(inactiveUsers);
            obj.setSchoolUsers(schoolUsers);
            obj.setTotalSchools(totalSchools);
            obj.setNewUsers(newUsers);
            obj.setThisMonthRegistrations(thisMonthRegistrations);
            obj.setThisWeekRegistrations(thisWeekRegistrations);
            obj.setTodayRegistrations(todayRegistrations);
            obj.setTotalLessons(totalLessons);
            obj.setActiveLessons(activeLessons);
            obj.setTotalSpeakingSessions(totalSpeakingSessions);
            obj.setTotalVocabularyWords(totalVocabularyWords);
            obj.setTotalAchievements(totalAchievements);
            obj.setTotalNotifications(totalNotifications);
            return obj;
        }
	}
}