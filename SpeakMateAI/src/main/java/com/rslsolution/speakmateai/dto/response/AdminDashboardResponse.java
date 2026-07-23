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
		private Long totalLessons;
		private Long activeLessons;
		private Long totalSpeakingSessions;
		private Long totalVocabularyWords;
		private Long totalAchievements;
		private Long totalNotifications;

		public AdminDashboardResponseBuilder totalUsers(Long totalUsers) { this.totalUsers = totalUsers; return this; }
		public AdminDashboardResponseBuilder activeUsers(Long activeUsers) { this.activeUsers = activeUsers; return this; }
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