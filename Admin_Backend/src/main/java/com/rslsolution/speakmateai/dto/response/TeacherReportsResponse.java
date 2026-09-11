package com.rslsolution.speakmateai.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherReportsResponse {
	private List<ReportCategoryResponse> reportCategories;
	private List<RecentReportResponse> recentReports;
	private ReportStatusResponse reportStatus;
	private StatisticsResponse performanceSummary;
	private List<UpcomingReportResponse> upcomingReports;
	private AcademicSessionResponse academicSession;
}
