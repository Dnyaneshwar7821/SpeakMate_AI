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
}