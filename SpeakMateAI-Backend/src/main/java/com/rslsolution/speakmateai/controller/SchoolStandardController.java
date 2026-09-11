package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.response.StandardDivisionResponse;
import com.rslsolution.speakmateai.service.SchoolStandardService;

import lombok.RequiredArgsConstructor;

/**
 * Exposes the canonical School -> Standard -> Division configuration.
 *
 * <p>
 * Route {@code /api/school/**} is already secured by SecurityConfig for
 * SUPER_ADMIN, ADMIN, SCHOOL_ADMIN and TEACHER. Role-specific school isolation
 * is enforced inside {@link SchoolStandardService}.
 */
@RestController
@RequestMapping("/api/school/standards")
@RequiredArgsConstructor
public class SchoolStandardController {

	private final SchoolStandardService schoolStandardService;

	/**
	 * GET /api/school/standards - standards + divisions for the current user's own
	 * school.
	 */
	@GetMapping
	public ResponseEntity<List<StandardDivisionResponse>> getMySchoolStandards() {
		return ResponseEntity.ok(schoolStandardService.getMySchoolStandards());
	}

	/**
	 * GET /api/school/standards/{schoolId} - standards + divisions for a specific
	 * school
	 * (allowed for SUPER_ADMIN/ADMIN on any school, SCHOOL_ADMIN/TEACHER only on
	 * their own).
	 */
	@GetMapping("/{schoolId}")
	public ResponseEntity<List<StandardDivisionResponse>> getStandards(@PathVariable Long schoolId) {
		return ResponseEntity.ok(schoolStandardService.getStandards(schoolId));
	}

	/**
	 * PUT /api/school/standards/{schoolId}/configure - replaces standard
	 * configuration
	 */
	@org.springframework.web.bind.annotation.PutMapping("/{schoolId}/configure")
	public ResponseEntity<List<StandardDivisionResponse>> configureStandards(
			@PathVariable Long schoolId,
			@org.springframework.web.bind.annotation.RequestBody List<StandardDivisionResponse> request) {
		return ResponseEntity.ok(schoolStandardService.configureStandards(schoolId, request));
	}
}
