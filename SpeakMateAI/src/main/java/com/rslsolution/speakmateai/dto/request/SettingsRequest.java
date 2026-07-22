package com.rslsolution.speakmateai.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettingsRequest {

	private Boolean darkMode;

	private Boolean notificationsEnabled;

	private String language;

	private String aiVoice;

	private Boolean soundEffects;

	private Boolean autoPlayAudio;

	private Boolean dailyReminder;

}