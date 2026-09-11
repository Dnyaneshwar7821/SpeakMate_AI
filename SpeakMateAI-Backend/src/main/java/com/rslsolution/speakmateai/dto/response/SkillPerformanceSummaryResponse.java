package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillPerformanceSummaryResponse {
	private Double grammar;
	private Double vocabulary;
	private Double speaking;
	private Double listening;
}
