package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.Role;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "First name is required")
	@Column(nullable = false)
	private String firstName;

	@NotBlank(message = "Last name is required")
	@Column(nullable = false)
	private String lastName;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	@Column(nullable = false, unique = true)
	private String email;

	@NotBlank(message = "Password is required")
	@Size(min = 8, message = "Password must be at least 8 characters")
	@Column(nullable = false)
	private String password;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role;

	@Column(columnDefinition = "LONGTEXT")
	private String avatar;

	@Builder.Default
	@Column(nullable = false)
	private boolean active = true;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
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

	private boolean welcomeCompleted;

	private boolean onboardingCompleted;

	private String authProvider; // LOCAL or GOOGLE

	private String resetPasswordToken;

	private LocalDateTime resetPasswordTokenExpiry;

	private String resetOtp;

	private LocalDateTime resetOtpExpiry;

	// Onboarding fields
	private String nativeLanguage;

	private String englishLevel;

	private String learningGoal;

	private Integer dailyGoalMinutes;

	private String preferredVoice;

	private String preferredAccent;

	private String interests;

	@OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<Progress> progressList;

	/** Expo push notification token — updated from the mobile app on every launch */
	@Column(length = 500)
	private String expoPushToken;

	@OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<Settings> settingsList;

	@OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<Onboarding> onboardingList;

	@OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<Vocabulary> vocabularyList;

	@OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<ChatSession> chatSessions;

	@OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<SpeakingSession> speakingSessions;

	@OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<GrammarHistory> grammarHistories;

	@OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<LessonProgress> lessonProgresses;

	@OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<Notification> notifications;

	@OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<ChatBookmark> chatBookmarks;

	@OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<Achievement> achievements;

}
