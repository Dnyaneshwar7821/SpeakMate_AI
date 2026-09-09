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
public class UserActivityResponse {
    
    private String activityType; // e.g. LESSON, SPEAKING, GRAMMAR
    private String title;
    private String description;
    private LocalDateTime activityDate;
    private String status; // e.g. COMPLETED, FAILED, PASSED

}
