package com.rslsolution.speakmateai.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.SettingsRequest;
import com.rslsolution.speakmateai.dto.response.SettingsResponse;
import com.rslsolution.speakmateai.service.SettingsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

	private final SettingsService settingsService;

	public SettingsController(SettingsService settingsService) {
		this.settingsService = settingsService;
	}

	@PostMapping("/create-settings")
	public SettingsResponse createSettings(@Valid @RequestBody SettingsRequest request) {

		return settingsService.createSettings(request);
	}

	@GetMapping("/get-settings")
	public SettingsResponse getSettings() {

		return settingsService.getSettings();
	}

	@PutMapping("/update-settings")
	public SettingsResponse updateSettings(@Valid @RequestBody SettingsRequest request) {

		return settingsService.updateSettings(request);
	}

	@DeleteMapping("/delete-settings")
	public String deleteSettings() {

		settingsService.deleteSettings();

		return "Settings deleted successfully.";
	}
}