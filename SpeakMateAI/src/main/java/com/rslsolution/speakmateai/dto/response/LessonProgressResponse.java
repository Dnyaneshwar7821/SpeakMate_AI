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
public class LessonProgressResponse {

	private Long id;
	private Long lessonId;
	private String lessonTitle;
	private String lessonCategory;
	private String lessonLevel;
	private Integer progressPercent;
	private Boolean completed;
	private Integer lastSectionIndex;
	private Integer timeSpentMinutes;
	private Integer xpEarned;
	private LocalDateTime lastOpenedAt;
	private LocalDateTime completedAt;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
