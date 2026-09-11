package com.rslsolution.speakmateai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.response.SchoolDashboardResponse;
import com.rslsolution.speakmateai.service.SchoolDashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/school/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
public class SchoolDashboardController {

	private final SchoolDashboardService schoolDashboardService;

	@GetMapping
	public ResponseEntity<SchoolDashboardResponse> getSchoolDashboard() {
		return ResponseEntity.ok(schoolDashboardService.getSchoolDashboard());
	}
}
