package com.rslsolution.speakmateai.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.AvatarRequest;
import com.rslsolution.speakmateai.dto.request.ProfileRequest;
import com.rslsolution.speakmateai.dto.response.ProfileResponse;
import com.rslsolution.speakmateai.service.ProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

	private final ProfileService profileService;

	public ProfileController(ProfileService profileService) {
		this.profileService = profileService;
	}

	@GetMapping("/get-profile")
	public ProfileResponse getProfile() {

		return profileService.getProfile();
	}

	@PutMapping("/update-profile")
	public ProfileResponse updateProfile(@Valid @RequestBody ProfileRequest request) {

		return profileService.updateProfile(request);
	}

	@PutMapping("/update-avatar")
	public ProfileResponse updateAvatar(@Valid @RequestBody AvatarRequest request) {

		return profileService.updateAvatar(request);
	}

	@PutMapping("/avatar")
	public ProfileResponse updateAvatarAlias(@Valid @RequestBody AvatarRequest request) {

		return profileService.updateAvatar(request);
	}
}
