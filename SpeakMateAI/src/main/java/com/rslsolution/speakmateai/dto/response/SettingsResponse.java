package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettingsResponse {

	private Long id;

	private Boolean darkMode;

	private Boolean notificationsEnabled;

	private String language;

	private String aiVoice;

	private Boolean soundEffects;

	private Boolean autoPlayAudio;

	private Boolean dailyReminder;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

}