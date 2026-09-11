package com.rslsolution.speakmateai.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.rslsolution.speakmateai.entity.Admin;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.AdminStatus;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.AdminRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

@Component
@Order(1)
public class SuperAdminDataSeeder implements CommandLineRunner {

	private static final Logger log = LoggerFactory.getLogger(SuperAdminDataSeeder.class);

	public static final String SUPER_ADMIN_EMAIL = "info@rslsolution.com";
	public static final String SUPER_ADMIN_RAW_PASSWORD = "Rsl@2015";

	private final AdminRepository adminRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public SuperAdminDataSeeder(AdminRepository adminRepository,
			UserRepository userRepository,
			PasswordEncoder passwordEncoder) {
		this.adminRepository = adminRepository;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) {
		try {
			seedAdminRecord();
			seedUserRecord();
		} catch (Exception e) {
			log.error("[SuperAdminDataSeeder] Error initializing super admin: {}", e.getMessage(), e);
		}
	}

	private void seedAdminRecord() {
		Admin admin = adminRepository.findByEmail(SUPER_ADMIN_EMAIL).orElse(null);
		if (admin == null) {
			admin = Admin.builder()
					.fullName("Super Admin")
					.email(SUPER_ADMIN_EMAIL)
					.password(passwordEncoder.encode(SUPER_ADMIN_RAW_PASSWORD))
					.role(Role.SUPER_ADMIN)
					.status(AdminStatus.ACTIVE)
					.phone("1234567890")
					.department("Administration")
					.designation("Platform Super Administrator")
					.theme("LIGHT")
					.language("en")
					.notificationsEnabled(true)
					.emailNotifications(true)
					.systemNotifications(true)
					.twoFactorEnabled(false)
					.sessionTimeout(30)
					.build();
			adminRepository.save(admin);
			log.info("[SuperAdminDataSeeder] Successfully created Super Admin {} in admins table.", SUPER_ADMIN_EMAIL);
		} else {
			boolean updated = false;
			if (admin.getRole() != Role.SUPER_ADMIN) {
				admin.setRole(Role.SUPER_ADMIN);
				updated = true;
			}
			if (admin.getStatus() != AdminStatus.ACTIVE) {
				admin.setStatus(AdminStatus.ACTIVE);
				updated = true;
			}
			if (updated) {
				adminRepository.save(admin);
				log.info("[SuperAdminDataSeeder] Synchronized role/status for Super Admin {}.", SUPER_ADMIN_EMAIL);
			}
		}
	}

	private void seedUserRecord() {
		User user = userRepository.findByEmail(SUPER_ADMIN_EMAIL).orElse(null);
		if (user == null) {
			Admin admin = adminRepository.findByEmail(SUPER_ADMIN_EMAIL).orElse(null);
			String encodedPassword = (admin != null) ? admin.getPassword() : passwordEncoder.encode(SUPER_ADMIN_RAW_PASSWORD);

			user = User.builder()
					.firstName("Super")
					.lastName("Admin")
					.email(SUPER_ADMIN_EMAIL)
					.password(encodedPassword)
					.role(Role.SUPER_ADMIN)
					.active(true)
					.authProvider("LOCAL")
					.welcomeCompleted(true)
					.onboardingCompleted(true)
					.build();
			userRepository.save(user);
			log.info("[SuperAdminDataSeeder] Successfully created Super Admin {} in users table.", SUPER_ADMIN_EMAIL);
		} else {
			boolean updated = false;
			if (user.getRole() != Role.SUPER_ADMIN) {
				user.setRole(Role.SUPER_ADMIN);
				updated = true;
			}
			if (!user.isActive()) {
				user.setActive(true);
				updated = true;
			}
			if (updated) {
				userRepository.save(user);
				log.info("[SuperAdminDataSeeder] Synchronized role/active status for User {}.", SUPER_ADMIN_EMAIL);
			}
		}
	}
}
