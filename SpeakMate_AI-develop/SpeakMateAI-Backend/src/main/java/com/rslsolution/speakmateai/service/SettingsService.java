package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.SettingsRequest;
import com.rslsolution.speakmateai.dto.response.SettingsResponse;

public interface SettingsService {

	SettingsResponse createSettings(SettingsRequest request);

	SettingsResponse getSettings();

	SettingsResponse updateSettings(SettingsRequest request);

	void deleteSettings();

}