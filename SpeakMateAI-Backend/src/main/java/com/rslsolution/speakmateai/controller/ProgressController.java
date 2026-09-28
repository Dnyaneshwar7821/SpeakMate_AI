package com.rslsolution.speakmateai.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.RequestParam;

import com.rslsolution.speakmateai.dto.request.ProgressRequest;
import com.rslsolution.speakmateai.dto.response.LeaderboardResponse;
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

	@PostMapping("/sync")
	public ProgressResponse syncProgress() {
		return progressService.syncProgress();
	}

	@PostMapping("/recalculate-all")
	public java.util.Map<String, Object> recalculateAllUsers() {
		return progressService.recalculateAllUsers();
	}

	@PostMapping("/recalculate/{userId}")
	public ProgressResponse recalculateUserProgress(@PathVariable Long userId) {
		return progressService.recalculateUserProgress(userId);
	}

	@PostMapping("/buy-freeze")
	public ProgressResponse buyStreakFreeze() {
		return progressService.buyStreakFreeze();
	}

	@GetMapping("/leaderboard")
	public java.util.List<LeaderboardResponse> getLeaderboard(@RequestParam(defaultValue = "10") int limit) {
		return progressService.getLeaderboard(limit);
	}
}