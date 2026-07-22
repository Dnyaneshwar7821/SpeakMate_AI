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

	public static SettingsRequestBuilder builder() {
		return new SettingsRequestBuilder();
	}

	public static class SettingsRequestBuilder {
		private Boolean darkMode;
		private Boolean notificationsEnabled;
		private String language;
		private String aiVoice;
		private Boolean soundEffects;
		private Boolean autoPlayAudio;
		private Boolean dailyReminder;

		public SettingsRequestBuilder darkMode(Boolean darkMode) { this.darkMode = darkMode; return this; }
		public SettingsRequestBuilder notificationsEnabled(Boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; return this; }
		public SettingsRequestBuilder language(String language) { this.language = language; return this; }
		public SettingsRequestBuilder aiVoice(String aiVoice) { this.aiVoice = aiVoice; return this; }
		public SettingsRequestBuilder soundEffects(Boolean soundEffects) { this.soundEffects = soundEffects; return this; }
		public SettingsRequestBuilder autoPlayAudio(Boolean autoPlayAudio) { this.autoPlayAudio = autoPlayAudio; return this; }
		public SettingsRequestBuilder dailyReminder(Boolean dailyReminder) { this.dailyReminder = dailyReminder; return this; }

		public SettingsRequest build() {
			return new SettingsRequest(darkMode, notificationsEnabled, language, aiVoice, soundEffects, autoPlayAudio, dailyReminder);
		}
	}
}