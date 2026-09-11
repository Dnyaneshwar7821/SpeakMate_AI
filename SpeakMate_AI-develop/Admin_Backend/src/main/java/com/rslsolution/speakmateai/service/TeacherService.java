package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.response.TeacherAnalyticsResponse;
import com.rslsolution.speakmateai.dto.response.TeacherDashboardResponse;
import com.rslsolution.speakmateai.dto.response.TeacherProfileResponse;
import com.rslsolution.speakmateai.dto.response.TeacherReportsResponse;
import com.rslsolution.speakmateai.dto.response.TeacherStudentDetailResponse;
import com.rslsolution.speakmateai.dto.response.TeacherStudentsListResponse;
import com.rslsolution.speakmateai.enums.Status;

import com.rslsolution.speakmateai.dto.request.ChangePasswordRequest;
import com.rslsolution.speakmateai.dto.request.TeacherProfileUpdateRequest;

public interface TeacherService {

    TeacherDashboardResponse getTeacherDashboard();

    TeacherStudentsListResponse getStudents(String search, Status status);

    TeacherStudentsListResponse getStudents(String search, Status status, String standard);

    TeacherStudentsListResponse getStudents(String search, Status status, String standard, String division);

    TeacherStudentDetailResponse getStudentDetail(Long studentId);

    TeacherAnalyticsResponse getAnalytics();

    TeacherAnalyticsResponse getAnalytics(Long classId, String standard, String division);

    TeacherStudentDetailResponse getStudentAnalytics(Long studentId);

    TeacherReportsResponse getReports();

    TeacherProfileResponse getProfile();

    TeacherProfileResponse updateProfile(TeacherProfileUpdateRequest request);

    void changePassword(ChangePasswordRequest request);

    byte[] downloadProfile();
}
