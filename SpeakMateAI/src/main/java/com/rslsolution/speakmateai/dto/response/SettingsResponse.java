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

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public Boolean getDarkMode() { return darkMode; }
	public void setDarkMode(Boolean darkMode) { this.darkMode = darkMode; }

	public Boolean getNotificationsEnabled() { return notificationsEnabled; }
	public void setNotificationsEnabled(Boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; }

	public String getLanguage() { return language; }
	public void setLanguage(String language) { this.language = language; }

	public String getAiVoice() { return aiVoice; }
	public void setAiVoice(String aiVoice) { this.aiVoice = aiVoice; }

	public Boolean getSoundEffects() { return soundEffects; }
	public void setSoundEffects(Boolean soundEffects) { this.soundEffects = soundEffects; }

	public Boolean getAutoPlayAudio() { return autoPlayAudio; }
	public void setAutoPlayAudio(Boolean autoPlayAudio) { this.autoPlayAudio = autoPlayAudio; }

	public Boolean getDailyReminder() { return dailyReminder; }
	public void setDailyReminder(Boolean dailyReminder) { this.dailyReminder = dailyReminder; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

	public static SettingsResponseBuilder builder() {
		return new SettingsResponseBuilder();
	}

	public static class SettingsResponseBuilder {
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

		public SettingsResponseBuilder id(Long id) { this.id = id; return this; }
		public SettingsResponseBuilder darkMode(Boolean darkMode) { this.darkMode = darkMode; return this; }
		public SettingsResponseBuilder notificationsEnabled(Boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; return this; }
		public SettingsResponseBuilder language(String language) { this.language = language; return this; }
		public SettingsResponseBuilder aiVoice(String aiVoice) { this.aiVoice = aiVoice; return this; }
		public SettingsResponseBuilder soundEffects(Boolean soundEffects) { this.soundEffects = soundEffects; return this; }
		public SettingsResponseBuilder autoPlayAudio(Boolean autoPlayAudio) { this.autoPlayAudio = autoPlayAudio; return this; }
		public SettingsResponseBuilder dailyReminder(Boolean dailyReminder) { this.dailyReminder = dailyReminder; return this; }
		public SettingsResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public SettingsResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

		public SettingsResponse build() {
			return new SettingsResponse(id, darkMode, notificationsEnabled, language, aiVoice, soundEffects, autoPlayAudio, dailyReminder, createdAt, updatedAt);
		}
	}
}