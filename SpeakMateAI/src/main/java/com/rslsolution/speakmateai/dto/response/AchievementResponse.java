package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchievementResponse {

	private Long id;

	private String title;

	private String description;

	private Integer xpReward;

	private Integer tier;

	private Boolean unlocked;

	private LocalDateTime unlockedAt;

	private LocalDateTime createdAt;

}