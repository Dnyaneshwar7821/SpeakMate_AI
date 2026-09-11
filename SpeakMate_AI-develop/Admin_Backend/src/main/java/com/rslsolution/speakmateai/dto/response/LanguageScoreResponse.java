package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LanguageScoreResponse {
    
    private double grammarScore;
    private double vocabularyScore;
    private double fluencyScore;
    private double pronunciationScore;

}
