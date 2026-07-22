package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

	private String name;
	private String icon;
	private String description;
	private Integer lessonCount;
	private Integer completedCount;
	private Integer totalXP;
}
