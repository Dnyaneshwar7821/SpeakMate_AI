package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.response.analytics.LessonDetailProgressDto;
import com.rslsolution.speakmateai.dto.response.analytics.StudentProgressProfileResponse;

public interface StudentProgressAnalyticsService {

    StudentProgressProfileResponse getStudentProgressProfile(Long userId);

    List<LessonDetailProgressDto> getStudentLessonsDetail(Long userId);
}
