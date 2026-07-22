package com.rslsolution.speakmateai.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.ProgressRequest;
import com.rslsolution.speakmateai.dto.response.ProgressResponse;
import com.rslsolution.speakmateai.service.ProgressService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

	private final ProgressService progressService;

	public ProgressController(ProgressService progressService) {
		this.progressService = progressService;
	}

	@PostMapping("/create-progress")
	public ProgressResponse createProgress(@Valid @RequestBody ProgressRequest request) {

		return progressService.createProgress(request);
	}

	@GetMapping("/get-progress")
	public ProgressResponse getProgress() {

		return progressService.getProgress();
	}

	@PutMapping("/update-progress")
	public ProgressResponse updateProgress(@Valid @RequestBody ProgressRequest request) {

		return progressService.updateProgress(request);
	}

	@DeleteMapping("/delete-progress")
	public String deleteProgress() {

		progressService.deleteProgress();

		return "Progress deleted successfully.";
	}
}