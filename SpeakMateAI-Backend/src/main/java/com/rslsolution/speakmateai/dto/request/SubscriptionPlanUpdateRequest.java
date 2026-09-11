package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlanUpdateRequest {

    @NotBlank(message = "Plan name is required")
    private String planName;

    private String description;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 month")
    private Integer durationMonths;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Double price;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotBlank(message = "Features are required")
    private String features;

    private Integer maxLessons;
    private Integer maxTests;
    private Integer aiPracticeLimit;
    private Integer grammarPracticeLimit;
    private Integer speakingPracticeLimit;
    private Integer vocabularyPracticeLimit;
    
    private Boolean isActive;
}
