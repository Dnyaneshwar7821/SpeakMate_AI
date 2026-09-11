package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.AdminStatus;
import com.rslsolution.speakmateai.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admins")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "Full name is required")
	@Column(nullable = false)
	private String fullName;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	@Column(nullable = false, unique = true)
	private String email;

	@NotBlank(message = "Password is required")
	@Column(nullable = false)
	private String password;

	private String phone;

	@Column(columnDefinition = "TEXT")
	private String profileImage;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private AdminStatus status;

	private LocalDateTime lastLogin;

	// --- Profile Fields ---
	private String department;
	private String designation;
	private String location;

	// --- Settings Fields ---
	@Builder.Default
	private String theme = "LIGHT";

	@Builder.Default
	private String language = "en";

	@Builder.Default
	private Boolean sidebarCollapsed = false;

	@Builder.Default
	private Boolean notificationsEnabled = true;

	@Builder.Default
	private Boolean emailNotifications = true;

	@Builder.Default
	private Boolean systemNotifications = true;

	@Builder.Default
	private Boolean twoFactorEnabled = false;

	@Builder.Default
	private int sessionTimeout = 30;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	private String resetPasswordToken;

	private LocalDateTime resetPasswordTokenExpiry;

	private String resetOtp;

	private LocalDateTime resetOtpExpiry;

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
