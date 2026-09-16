package com.rslsolution.speakmateai.dto.response.analytics;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentActivityItemDto {
    private String activityType; // LESSON, SPEAKING, GRAMMAR, VOCABULARY
    private Long relatedId;
    private String title;
    private String description;
    private String scoreOrValue;
    private Integer xpEarned;
    private LocalDateTime timestamp;
    private String status;
}
