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
public class SchoolAssessmentsDto {
    private boolean isSchoolStudent;
    private Integer totalTests;
    private Integer completedTests;
    private Double averageTestPercentage;
    private List<AssessmentResultDto> recentResults;
    private AssignmentSummaryDto assignmentsSummary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssessmentResultDto {
        private Long id;
        private String testTitle;
        private Double marksObtained;
        private Double totalMarks;
        private Double percentage;
        private String status;
        private LocalDateTime submittedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentSummaryDto {
        private Integer totalAssigned;
        private Integer inProgress;
        private Integer completed;
        private Integer overdue;
        private Double averageScore;
    }
}
