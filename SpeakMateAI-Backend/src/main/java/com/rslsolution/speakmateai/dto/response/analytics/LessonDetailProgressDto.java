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
public class LessonDetailProgressDto {
    private Long lessonId;
    private String title;
    private String category;
    private String level;
    private String status; // COMPLETED, IN_PROGRESS, NOT_STARTED
    private Integer progressPercent;
    private Integer timeSpentMinutes;
    private LocalDateTime lastOpenedAt;
    private LocalDateTime completedAt;
    private Integer xpReward;
    private Integer xpEarned;
    private Integer estimatedMinutes;
    private Integer orderIndex;
}
