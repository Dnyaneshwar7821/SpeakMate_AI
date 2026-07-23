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

	@Column(columnDefinition = "TEXT")
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

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getFirstName() { return firstName; }
	public void setFirstName(String firstName) { this.firstName = firstName; }

	public String getLastName() { return lastName; }
	public void setLastName(String lastName) { this.lastName = lastName; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getPassword() { return password; }
	public void setPassword(String password) { this.password = password; }

	public Role getRole() { return role; }
	public void setRole(Role role) { this.role = role; }

	public String getAvatar() { return avatar; }
	public void setAvatar(String avatar) { this.avatar = avatar; }

	public boolean isActive() { return active; }
	public void setActive(boolean active) { this.active = active; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

	public boolean isWelcomeCompleted() { return welcomeCompleted; }
	public void setWelcomeCompleted(boolean welcomeCompleted) { this.welcomeCompleted = welcomeCompleted; }

	public boolean isOnboardingCompleted() { return onboardingCompleted; }
	public void setOnboardingCompleted(boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; }

	public String getAuthProvider() { return authProvider; }
	public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }

	public String getResetPasswordToken() { return resetPasswordToken; }
	public void setResetPasswordToken(String resetPasswordToken) { this.resetPasswordToken = resetPasswordToken; }

	public LocalDateTime getResetPasswordTokenExpiry() { return resetPasswordTokenExpiry; }
	public void setResetPasswordTokenExpiry(LocalDateTime resetPasswordTokenExpiry) { this.resetPasswordTokenExpiry = resetPasswordTokenExpiry; }

	public String getResetOtp() { return resetOtp; }
	public void setResetOtp(String resetOtp) { this.resetOtp = resetOtp; }

	public LocalDateTime getResetOtpExpiry() { return resetOtpExpiry; }
	public void setResetOtpExpiry(LocalDateTime resetOtpExpiry) { this.resetOtpExpiry = resetOtpExpiry; }

	public String getNativeLanguage() { return nativeLanguage; }
	public void setNativeLanguage(String nativeLanguage) { this.nativeLanguage = nativeLanguage; }

	public String getEnglishLevel() { return englishLevel; }
	public void setEnglishLevel(String englishLevel) { this.englishLevel = englishLevel; }

	public String getLearningGoal() { return learningGoal; }
	public void setLearningGoal(String learningGoal) { this.learningGoal = learningGoal; }

	public Integer getDailyGoalMinutes() { return dailyGoalMinutes; }
	public void setDailyGoalMinutes(Integer dailyGoalMinutes) { this.dailyGoalMinutes = dailyGoalMinutes; }

	public String getPreferredVoice() { return preferredVoice; }
	public void setPreferredVoice(String preferredVoice) { this.preferredVoice = preferredVoice; }

	public String getPreferredAccent() { return preferredAccent; }
	public void setPreferredAccent(String preferredAccent) { this.preferredAccent = preferredAccent; }

	public String getInterests() { return interests; }
	public void setInterests(String interests) { this.interests = interests; }

	public String getExpoPushToken() { return expoPushToken; }
	public void setExpoPushToken(String expoPushToken) { this.expoPushToken = expoPushToken; }

	public static UserBuilder builder() {
		return new UserBuilder();
	}

	public static class UserBuilder {
		private Long id;
		private String firstName;
		private String lastName;
		private String email;
		private String password;
		private Role role;
		private String avatar;
		private boolean active = true;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;
		private boolean welcomeCompleted;
		private boolean onboardingCompleted;
		private String authProvider;
		private String resetPasswordToken;
		private LocalDateTime resetPasswordTokenExpiry;
		private String resetOtp;
		private LocalDateTime resetOtpExpiry;
		private String nativeLanguage;
		private String englishLevel;
		private String learningGoal;
		private Integer dailyGoalMinutes;
		private String preferredVoice;
		private String preferredAccent;
		private String interests;
		private String expoPushToken;

		public UserBuilder id(Long id) { this.id = id; return this; }
		public UserBuilder firstName(String firstName) { this.firstName = firstName; return this; }
		public UserBuilder lastName(String lastName) { this.lastName = lastName; return this; }
		public UserBuilder email(String email) { this.email = email; return this; }
		public UserBuilder password(String password) { this.password = password; return this; }
		public UserBuilder role(Role role) { this.role = role; return this; }
		public UserBuilder avatar(String avatar) { this.avatar = avatar; return this; }
		public UserBuilder active(boolean active) { this.active = active; return this; }
		public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public UserBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
		public UserBuilder welcomeCompleted(boolean welcomeCompleted) { this.welcomeCompleted = welcomeCompleted; return this; }
		public UserBuilder onboardingCompleted(boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; return this; }
		public UserBuilder authProvider(String authProvider) { this.authProvider = authProvider; return this; }
		public UserBuilder resetPasswordToken(String resetPasswordToken) { this.resetPasswordToken = resetPasswordToken; return this; }
		public UserBuilder resetPasswordTokenExpiry(LocalDateTime resetPasswordTokenExpiry) { this.resetPasswordTokenExpiry = resetPasswordTokenExpiry; return this; }
		public UserBuilder resetOtp(String resetOtp) { this.resetOtp = resetOtp; return this; }
		public UserBuilder resetOtpExpiry(LocalDateTime resetOtpExpiry) { this.resetOtpExpiry = resetOtpExpiry; return this; }
		public UserBuilder nativeLanguage(String nativeLanguage) { this.nativeLanguage = nativeLanguage; return this; }
		public UserBuilder englishLevel(String englishLevel) { this.englishLevel = englishLevel; return this; }
		public UserBuilder learningGoal(String learningGoal) { this.learningGoal = learningGoal; return this; }
		public UserBuilder dailyGoalMinutes(Integer dailyGoalMinutes) { this.dailyGoalMinutes = dailyGoalMinutes; return this; }
		public UserBuilder preferredVoice(String preferredVoice) { this.preferredVoice = preferredVoice; return this; }
		public UserBuilder preferredAccent(String preferredAccent) { this.preferredAccent = preferredAccent; return this; }
		public UserBuilder interests(String interests) { this.interests = interests; return this; }
		public UserBuilder expoPushToken(String expoPushToken) { this.expoPushToken = expoPushToken; return this; }

		public User build() {
			User user = new User();
			user.setId(id);
			user.setFirstName(firstName);
			user.setLastName(lastName);
			user.setEmail(email);
			user.setPassword(password);
			user.setRole(role);
			user.setAvatar(avatar);
			user.setActive(active);
			user.setCreatedAt(createdAt);
			user.setUpdatedAt(updatedAt);
			user.setWelcomeCompleted(welcomeCompleted);
			user.setOnboardingCompleted(onboardingCompleted);
			user.setAuthProvider(authProvider);
			user.setResetPasswordToken(resetPasswordToken);
			user.setResetPasswordTokenExpiry(resetPasswordTokenExpiry);
			user.setResetOtp(resetOtp);
			user.setResetOtpExpiry(resetOtpExpiry);
			user.setNativeLanguage(nativeLanguage);
			user.setEnglishLevel(englishLevel);
			user.setLearningGoal(learningGoal);
			user.setDailyGoalMinutes(dailyGoalMinutes);
			user.setPreferredVoice(preferredVoice);
			user.setPreferredAccent(preferredAccent);
			user.setInterests(interests);
			user.setExpoPushToken(expoPushToken);
			return user;
		}
	}
}
