package com.rslsolution.speakmateai.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAttentionAreaDto {
    private String area;          // e.g., "Speaking Practice Volume", "Grammar Syntax", "Lesson Engagement", "Declining Speaking Trend"
    private String scoreOrValue;  // e.g., "0 Sessions", "54% Accuracy", "Declining (↓ 6.2%)"
    private String reason;        // Deterministic reason grounded in actual metrics
}
