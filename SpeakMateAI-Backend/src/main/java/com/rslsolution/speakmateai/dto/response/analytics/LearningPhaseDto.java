package com.rslsolution.speakmateai.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPhaseDto {
    private LearningPhase phase;
    private String displayName;
    private String shortDescription;
    private String reason;
    private Double confidence;
}
