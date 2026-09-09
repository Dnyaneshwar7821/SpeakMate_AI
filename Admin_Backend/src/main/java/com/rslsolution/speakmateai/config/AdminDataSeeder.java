package com.rslsolution.speakmateai.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.rslsolution.speakmateai.entity.Admin;
import com.rslsolution.speakmateai.enums.AdminStatus;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.AdminRepository;

@Component
public class AdminDataSeeder implements CommandLineRunner {

	private final AdminRepository adminRepository;
	private final PasswordEncoder passwordEncoder;

	public AdminDataSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
		this.adminRepository = adminRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) {
		try {
			String adminEmail = "admin@speakmate.ai";
			if (!adminRepository.findByEmail(adminEmail).isPresent()) {
				Admin defaultAdmin = Admin.builder()
						.fullName("Super Admin")
						.email(adminEmail)
						.password(passwordEncoder.encode("Admin@123"))
						.role(Role.SUPER_ADMIN)
						.status(AdminStatus.ACTIVE)
						.profileImage("")
						.phone("1234567890")
						.build();
				adminRepository.save(defaultAdmin);
				System.out.println("[Admin Data Seeder] Successfully created default Super Admin account.");
			} else {
				System.out.println("[Admin Data Seeder] Super Admin account already exists. Skipping seeding.");
			}
		} catch (Exception e) {
			System.err.println("[Admin Data Seeder] Failed to seed default admin: " + e.getMessage());
		}
	}
}
