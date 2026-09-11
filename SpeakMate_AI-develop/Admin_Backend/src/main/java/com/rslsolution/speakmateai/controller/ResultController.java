package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.ResultRequest;
import com.rslsolution.speakmateai.dto.response.ResultResponse;
import com.rslsolution.speakmateai.service.ResultService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/school/results")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
public class ResultController {

	private final ResultService resultService;

	@GetMapping
	public ResponseEntity<List<ResultResponse>> getAllResults() {
		return ResponseEntity.ok(resultService.getAllResults());
	}

	@GetMapping("/search")
	public ResponseEntity<List<ResultResponse>> searchResults(@RequestParam String q) {
		return ResponseEntity.ok(resultService.searchResults(q));
	}

	@GetMapping("/student/{studentId}")
	public ResponseEntity<List<ResultResponse>> getResultsByStudent(@PathVariable Long studentId) {
		return ResponseEntity.ok(resultService.getResultsByStudent(studentId));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ResultResponse> getResultById(@PathVariable Long id) {
		return ResponseEntity.ok(resultService.getResultById(id));
	}

	@PostMapping
	public ResponseEntity<ResultResponse> createResult(@Valid @RequestBody ResultRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(resultService.createResult(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ResultResponse> updateResult(@PathVariable Long id, @Valid @RequestBody ResultRequest request) {
		return ResponseEntity.ok(resultService.updateResult(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteResult(@PathVariable Long id) {
		resultService.deleteResult(id);
		return ResponseEntity.noContent().build();
	}
}
