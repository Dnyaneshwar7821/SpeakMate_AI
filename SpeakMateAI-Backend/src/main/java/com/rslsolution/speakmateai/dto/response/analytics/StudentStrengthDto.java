package com.rslsolution.speakmateai.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStrengthDto {
    private String area;          // e.g., "Grammar Precision", "Speaking Fluency", "Consistent Habit", "Curriculum Progress"
    private String scoreOrValue;  // e.g., "88% Accuracy", "5-Day Streak", "78% Fluency"
    private String reason;        // Deterministic rationale derived from real performance
}
