package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserVocabularyResponse {
    
    private int wordsLearned;
    private int masteredWords;
    private int pendingRevision;
    private double vocabularyScore;

}
