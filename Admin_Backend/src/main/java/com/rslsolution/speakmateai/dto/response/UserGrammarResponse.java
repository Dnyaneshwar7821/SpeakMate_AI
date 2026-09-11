package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserGrammarResponse {
    
    private int exercisesCompleted;
    private double accuracy; // Percentage
    private int totalMistakes;
    private double improvementPercentage;

}
