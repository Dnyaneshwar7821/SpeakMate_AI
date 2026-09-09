package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.UserType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
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

	@Builder.Default
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private UserType userType = UserType.STANDARD;

	@Column(columnDefinition = "TEXT")
	private String avatar;

	private Long schoolId;

	@Enumerated(EnumType.STRING)
	private com.rslsolution.speakmateai.enums.Status status;

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

	private String emailVerificationToken;

	private boolean emailVerified;

	// Onboarding fields
	private String nativeLanguage;

	private String englishLevel;

	private String learningGoal;

	private Integer dailyGoalMinutes;

	private String preferredVoice;

	private String preferredAccent;

	private String ageGroup;

	private String interests;

	private String phone;

	private String schoolName;

	private String standard;

	private String division;

	private String rollNumber;

	private String parentName;

	private String parentPhone;

	@ToString.Exclude
	@EqualsAndHashCode.Exclude
	@Transient
	private Progress progress;

	/**
	 * Expo push notification token — updated from the mobile app on every launch
	 */
	@Column(length = 500)
	private String expoPushToken;

	@ToString.Exclude
	@EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Settings> settingsList;

	// @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	// private java.util.List<Onboarding> onboardingList;

	// @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	// private java.util.List<Vocabulary> vocabularyList;

	// @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	// private java.util.List<ChatSession> chatSessions;

	// @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	// private java.util.List<SpeakingSession> speakingSessions;

	// @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	// private java.util.List<GrammarHistory> grammarHistories;

	// @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	// private java.util.List<LessonProgress> lessonProgresses;

	// @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	// private java.util.List<Notification> notifications;

	// @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	// private java.util.List<ChatBookmark> chatBookmarks;

	// @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	// private java.util.List<Achievement> achievements;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public String getAvatar() {
		return avatar;
	}

	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public boolean isWelcomeCompleted() {
		return welcomeCompleted;
	}

	public void setWelcomeCompleted(boolean welcomeCompleted) {
		this.welcomeCompleted = welcomeCompleted;
	}

	public boolean isOnboardingCompleted() {
		return onboardingCompleted;
	}

	public void setOnboardingCompleted(boolean onboardingCompleted) {
		this.onboardingCompleted = onboardingCompleted;
	}

	public String getAuthProvider() {
		return authProvider;
	}

	public void setAuthProvider(String authProvider) {
		this.authProvider = authProvider;
	}

	public String getResetPasswordToken() {
		return resetPasswordToken;
	}

	public void setResetPasswordToken(String resetPasswordToken) {
		this.resetPasswordToken = resetPasswordToken;
	}

	public LocalDateTime getResetPasswordTokenExpiry() {
		return resetPasswordTokenExpiry;
	}

	public void setResetPasswordTokenExpiry(LocalDateTime resetPasswordTokenExpiry) {
		this.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
	}

	public String getResetOtp() {
		return resetOtp;
	}

	public void setResetOtp(String resetOtp) {
		this.resetOtp = resetOtp;
	}

	public LocalDateTime getResetOtpExpiry() {
		return resetOtpExpiry;
	}

	public void setResetOtpExpiry(LocalDateTime resetOtpExpiry) {
		this.resetOtpExpiry = resetOtpExpiry;
	}

	public String getNativeLanguage() {
		return nativeLanguage;
	}

	public void setNativeLanguage(String nativeLanguage) {
		this.nativeLanguage = nativeLanguage;
	}

	public String getEnglishLevel() {
		return englishLevel;
	}

	public void setEnglishLevel(String englishLevel) {
		this.englishLevel = englishLevel;
	}

	public String getLearningGoal() {
		return learningGoal;
	}

	public void setLearningGoal(String learningGoal) {
		this.learningGoal = learningGoal;
	}

	public Integer getDailyGoalMinutes() {
		return dailyGoalMinutes;
	}

	public void setDailyGoalMinutes(Integer dailyGoalMinutes) {
		this.dailyGoalMinutes = dailyGoalMinutes;
	}

	public String getPreferredVoice() {
		return preferredVoice;
	}

	public void setPreferredVoice(String preferredVoice) {
		this.preferredVoice = preferredVoice;
	}

	public String getPreferredAccent() {
		return preferredAccent;
	}

	public void setPreferredAccent(String preferredAccent) {
		this.preferredAccent = preferredAccent;
	}

	public String getInterests() {
		return interests;
	}

	public void setInterests(String interests) {
		this.interests = interests;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getSchoolName() {
		return schoolName;
	}

	public void setSchoolName(String schoolName) {
		this.schoolName = schoolName;
	}

	public String getStandard() {
		return standard;
	}

	public void setStandard(String standard) {
		this.standard = standard;
	}

	public String getDivision() {
		return division;
	}

	public void setDivision(String division) {
		this.division = division;
	}

	public String getRollNumber() {
		return rollNumber;
	}

	public void setRollNumber(String rollNumber) {
		this.rollNumber = rollNumber;
	}

	public String getParentName() {
		return parentName;
	}

	public void setParentName(String parentName) {
		this.parentName = parentName;
	}

	public String getParentPhone() {
		return parentPhone;
	}

	public void setParentPhone(String parentPhone) {
		this.parentPhone = parentPhone;
	}

	public String getExpoPushToken() {
		return expoPushToken;
	}

	public void setExpoPushToken(String expoPushToken) {
		this.expoPushToken = expoPushToken;
	}

	public UserType getUserType() {
		return userType;
	}

	public void setUserType(UserType userType) {
		this.userType = userType;
	}

	public Progress getProgress() {
		return progress;
	}

	public void setProgress(Progress progress) {
		this.progress = progress;
	}


}
