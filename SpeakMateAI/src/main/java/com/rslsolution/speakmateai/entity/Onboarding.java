package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "onboarding")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Onboarding {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Column(nullable = false)
	private String englishLevel;

	@Column(nullable = false)
	private String learningGoal;

	@Column(nullable = false)
	private Integer dailyGoalMinutes;

	@Column(nullable = false)
	private String nativeLanguage;

	@Column(nullable = false)
	private String preferredLearningTime;

	@Column(nullable = false)
	private String interests;

	@Builder.Default
	private Boolean onboardingCompleted = false;

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