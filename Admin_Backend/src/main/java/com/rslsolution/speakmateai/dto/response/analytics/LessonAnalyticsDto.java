package com.rslsolution.speakmateai.dto.response.analytics;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonAnalyticsDto {
    private Integer totalActiveLessons;
    private Integer completedLessons;
    private Integer inProgressLessons;
    private Integer notStartedLessons;
    private Double completionPercentage;
    private Integer totalLessonTimeMinutes;
    private List<RecentCompletedLessonDto> recentlyCompletedLessons;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentCompletedLessonDto {
        private Long lessonId;
        private String title;
        private String category;
        private String level;
        private Integer progressPercent;
        private Integer timeSpentMinutes;
        private LocalDateTime completedAt;
        private Integer xpEarned;
    }
}
