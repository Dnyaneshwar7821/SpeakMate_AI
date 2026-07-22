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

}