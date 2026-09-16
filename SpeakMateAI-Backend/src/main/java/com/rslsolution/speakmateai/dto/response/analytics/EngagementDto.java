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
public class EngagementDto {
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer totalPracticeMinutes;
    private Integer speakingMinutes;
    private Integer lessonStudyMinutes;
    private LocalDateTime recentActivityDate;
    private Integer activityDaysLast7Days;
    private Integer activityDaysLast30Days;
    private Integer speakingSessionsLast7Days;
    private Integer speakingSessionsLast30Days;
    private ActivityStatus activityStatus;
    private String activityStatusDescription;
}
