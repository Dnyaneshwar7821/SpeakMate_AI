package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.SchoolTeacherRequest;
import com.rslsolution.speakmateai.dto.response.SchoolTeacherResponse;

public interface SchoolTeacherService {

	SchoolTeacherResponse createTeacher(SchoolTeacherRequest request);

	List<SchoolTeacherResponse> getAllTeachers();

	List<SchoolTeacherResponse> searchTeachers(String query);

	SchoolTeacherResponse getTeacherById(Long id);

	SchoolTeacherResponse updateTeacher(Long id, SchoolTeacherRequest request);

	void deactivateTeacher(Long id);
	SchoolTeacherResponse activateTeacher(Long id);
	SchoolTeacherResponse deactivateTeacherStatus(Long id);
	SchoolTeacherResponse getAssignedTeacher(Long schoolId, String standard, String division);
}
