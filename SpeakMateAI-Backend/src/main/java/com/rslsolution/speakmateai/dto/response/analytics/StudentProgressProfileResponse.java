package com.rslsolution.speakmateai.dto.response.analytics;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgressProfileResponse {
    private StudentSummaryDto student;
    private CoreSummaryKpiDto summary;
    private LearningPhaseDto learningPhase;
    private EngagementDto engagement;
    private LessonAnalyticsDto lessons;
    private SpeakingAnalyticsDto speaking;
    private GrammarAnalyticsDto grammar;
    private VocabularyAnalyticsDto vocabulary;
    private SchoolAssessmentsDto assessments;
    private List<StudentStrengthDto> strengths;
    private List<StudentAttentionAreaDto> areasNeedingAttention;
    private List<StudentActivityItemDto> recentActivity;
    private TimeSeriesAnalyticsDto timeSeries;
}
