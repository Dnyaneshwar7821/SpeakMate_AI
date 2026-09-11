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
public class UserSpeakingResponse {
    
    private int totalSpeakingSessions;
    private double averageSpeakingScore;
    private int totalSpeakingMinutes;
    private LocalDateTime lastSpeakingDate;
    private double bestSpeakingScore;

}
