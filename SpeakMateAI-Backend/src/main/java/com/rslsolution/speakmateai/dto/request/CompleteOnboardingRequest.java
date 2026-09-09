package com.rslsolution.speakmateai.dto.request;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompleteOnboardingRequest {
    private String nativeLanguage;
    private String goal;
    private String ageGroup;
    private String englishLevel;
    private String schoolGrade;
    private List<String> interests;
    private String aiVoice;
    private String commitment;
}
