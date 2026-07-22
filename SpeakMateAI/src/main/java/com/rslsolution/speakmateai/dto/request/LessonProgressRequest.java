package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgressRequest {

	@NotNull(message = "Lesson ID is required")
	private Long lessonId;

	@Min(0) @Max(100)
	private Integer progressPercent;

	@Min(0)
	private Integer lastSectionIndex;

	@Min(0)
	private Integer timeSpentMinutes;
}
