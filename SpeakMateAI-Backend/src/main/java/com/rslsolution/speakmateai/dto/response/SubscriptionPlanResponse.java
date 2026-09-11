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
public class SubscriptionPlanResponse {

    private Long id;
    private String planName;
    private String description;
    private Integer durationMonths;
    private Double price;
    private String currency;
    private String features;

    private Integer maxLessons;
    private Integer maxTests;
    private Integer aiPracticeLimit;
    private Integer grammarPracticeLimit;
    private Integer speakingPracticeLimit;
    private Integer vocabularyPracticeLimit;

    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
