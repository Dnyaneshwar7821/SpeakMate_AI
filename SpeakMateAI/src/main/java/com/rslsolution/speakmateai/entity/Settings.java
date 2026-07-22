package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settings {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Builder.Default
	private Boolean darkMode = false;

	@Builder.Default
	private Boolean notificationsEnabled = true;

	@Builder.Default
	private String language = "English";

	@Builder.Default
	private String aiVoice = "Female";

	@Builder.Default
	private Boolean soundEffects = true;

	@Builder.Default
	private Boolean autoPlayAudio = true;

	@Builder.Default
	private Boolean dailyReminder = true;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	public void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

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
}