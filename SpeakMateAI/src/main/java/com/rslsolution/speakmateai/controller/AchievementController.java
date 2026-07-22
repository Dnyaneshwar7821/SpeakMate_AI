package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.AchievementRequest;
import com.rslsolution.speakmateai.dto.response.AchievementResponse;
import com.rslsolution.speakmateai.service.AchievementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/achievement")
public class AchievementController {

	private final AchievementService achievementService;

	public AchievementController(AchievementService achievementService) {
		this.achievementService = achievementService;
	}

	@PostMapping("/create-achievement")
	public AchievementResponse createAchievement(@Valid @RequestBody AchievementRequest request) {

		return achievementService.createAchievement(request);
	}

	@GetMapping("/get-all-achievements")
	public List<AchievementResponse> getAllAchievements() {

		return achievementService.getAllAchievements();
	}

	@GetMapping("/get-achievement/{id}")
	public AchievementResponse getAchievementById(@PathVariable Long id) {

		return achievementService.getAchievementById(id);
	}

	@GetMapping("/get-unlocked-achievements")
	public List<AchievementResponse> getUnlockedAchievements() {

		return achievementService.getUnlockedAchievements();
	}

	@DeleteMapping("/delete-achievement/{id}")
	public String deleteAchievementById(@PathVariable Long id) {

		achievementService.deleteAchievementById(id);

		return "Achievement deleted successfully.";
	}
}