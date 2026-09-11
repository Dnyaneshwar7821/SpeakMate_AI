package com.rslsolution.speakmateai.controller;

import com.rslsolution.speakmateai.dto.request.ChangePasswordRequest;
import com.rslsolution.speakmateai.dto.request.TeacherProfileUpdateRequest;
import com.rslsolution.speakmateai.dto.response.TeacherAnalyticsResponse;
import com.rslsolution.speakmateai.dto.response.TeacherDashboardResponse;
import com.rslsolution.speakmateai.dto.response.TeacherProfileResponse;
import com.rslsolution.speakmateai.dto.response.TeacherReportsResponse;
import com.rslsolution.speakmateai.dto.response.TeacherStudentDetailResponse;
import com.rslsolution.speakmateai.dto.response.TeacherStudentsListResponse;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TEACHER', 'SCHOOL_ADMIN', 'ADMIN', 'SUPER_ADMIN')")
public class TeacherController {

	private final TeacherService teacherService;

	@GetMapping("/dashboard")
	public ResponseEntity<TeacherDashboardResponse> getTeacherDashboard() {
		return ResponseEntity.ok(teacherService.getTeacherDashboard());
	}

	@GetMapping("/students")
	public ResponseEntity<TeacherStudentsListResponse> getStudents(
			@RequestParam(required = false) String search,
			@RequestParam(required = false) Status status,
			@RequestParam(required = false) String standard,
			@RequestParam(required = false) String division) {
		return ResponseEntity.ok(teacherService.getStudents(search, status, standard, division));
	}

	@GetMapping("/students/{studentId}")
	public ResponseEntity<TeacherStudentDetailResponse> getStudentDetail(@PathVariable Long studentId) {
		return ResponseEntity.ok(teacherService.getStudentDetail(studentId));
	}

	@GetMapping("/analytics")
	public ResponseEntity<TeacherAnalyticsResponse> getAnalytics(
			@RequestParam(required = false) Long classId,
			@RequestParam(required = false) String standard,
			@RequestParam(required = false) String division) {
		return ResponseEntity.ok(teacherService.getAnalytics(classId, standard, division));
	}

	@GetMapping("/students/{studentId}/analytics")
	public ResponseEntity<TeacherStudentDetailResponse> getStudentAnalytics(@PathVariable Long studentId) {
		return ResponseEntity.ok(teacherService.getStudentAnalytics(studentId));
	}

	@GetMapping("/reports")
	public ResponseEntity<TeacherReportsResponse> getReports() {
		return ResponseEntity.ok(teacherService.getReports());
	}

	@GetMapping("/profile")
	public ResponseEntity<TeacherProfileResponse> getProfile() {
		return ResponseEntity.ok(teacherService.getProfile());
	}

	@PutMapping("/profile")
	public ResponseEntity<TeacherProfileResponse> updateProfile(@Valid @RequestBody TeacherProfileUpdateRequest request) {
		return ResponseEntity.ok(teacherService.updateProfile(request));
	}

	@PostMapping("/change-password")
	public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
		teacherService.changePassword(request);
		return ResponseEntity.ok(Collections.singletonMap("message", "Password changed successfully"));
	}

	@GetMapping("/profile/download")
	public ResponseEntity<byte[]> downloadProfile() {
		byte[] data = teacherService.downloadProfile();
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"SpeakMate_Teacher_Profile.json\"")
				.contentType(MediaType.APPLICATION_JSON)
				.body(data);
	}
}
