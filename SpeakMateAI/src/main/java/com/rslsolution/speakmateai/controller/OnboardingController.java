package com.rslsolution.speakmateai.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.OnboardingRequest;
import com.rslsolution.speakmateai.dto.response.OnboardingResponse;
import com.rslsolution.speakmateai.service.OnboardingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

	private final OnboardingService onboardingService;

	public OnboardingController(OnboardingService onboardingService) {
		this.onboardingService = onboardingService;
	}

	@PostMapping("/create-onboarding")
	public OnboardingResponse createOnboarding(@Valid @RequestBody OnboardingRequest request) {

		return onboardingService.createOnboarding(request);
	}

	@GetMapping("/get-onboarding")
	public OnboardingResponse getOnboarding() {

		return onboardingService.getOnboarding();
	}

	@PutMapping("/update-onboarding")
	public OnboardingResponse updateOnboarding(@Valid @RequestBody OnboardingRequest request) {

		return onboardingService.updateOnboarding(request);
	}

	@PutMapping
	public OnboardingResponse updateOnboardingAlias(@Valid @RequestBody OnboardingRequest request) {

		return onboardingService.updateOnboarding(request);
	}

	@DeleteMapping("/delete-onboarding")
	public String deleteOnboarding() {

		onboardingService.deleteOnboarding();

		return "Onboarding deleted successfully.";
	}
}
