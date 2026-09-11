package com.rslsolution.speakmateai.config;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.entity.Admin;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.AdminStatus;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.AdminRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

public class SuperAdminDataSeederTest {

	private AdminRepository adminRepository;
	private UserRepository userRepository;
	private PasswordEncoder passwordEncoder;
	private SuperAdminDataSeeder seeder;

	@BeforeEach
	void setUp() {
		adminRepository = mock(AdminRepository.class);
		userRepository = mock(UserRepository.class);
		passwordEncoder = new BCryptPasswordEncoder();
		seeder = new SuperAdminDataSeeder(adminRepository, userRepository, passwordEncoder);
	}

	@Test
	void testSeedNewSuperAdmin() {
		when(adminRepository.findByEmail("info@rslsolution.com")).thenReturn(Optional.empty());
		when(userRepository.findByEmail("info@rslsolution.com")).thenReturn(Optional.empty());

		seeder.run();

		ArgumentCaptor<Admin> adminCaptor = ArgumentCaptor.forClass(Admin.class);
		verify(adminRepository).save(adminCaptor.capture());
		Admin savedAdmin = adminCaptor.getValue();

		assertEquals("info@rslsolution.com", savedAdmin.getEmail());
		assertEquals("Super Admin", savedAdmin.getFullName());
		assertEquals(Role.SUPER_ADMIN, savedAdmin.getRole());
		assertEquals(AdminStatus.ACTIVE, savedAdmin.getStatus());
		assertTrue(passwordEncoder.matches("Rsl@2015", savedAdmin.getPassword()));

		System.out.println("Generated BCrypt Hash for Rsl@2015: " + savedAdmin.getPassword());

		ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
		verify(userRepository).save(userCaptor.capture());
		User savedUser = userCaptor.getValue();

		assertEquals("info@rslsolution.com", savedUser.getEmail());
		assertEquals(Role.SUPER_ADMIN, savedUser.getRole());
		assertTrue(savedUser.isActive());
	}

	@Test
	void testPreserveExistingPassword() {
		String customPasswordHash = passwordEncoder.encode("MyNewSecretPassword@999");
		Admin existingAdmin = Admin.builder()
				.email("info@rslsolution.com")
				.password(customPasswordHash)
				.role(Role.SUPER_ADMIN)
				.status(AdminStatus.ACTIVE)
				.build();
		when(adminRepository.findByEmail("info@rslsolution.com")).thenReturn(Optional.of(existingAdmin));

		User existingUser = User.builder()
				.email("info@rslsolution.com")
				.password(customPasswordHash)
				.role(Role.SUPER_ADMIN)
				.active(true)
				.build();
		when(userRepository.findByEmail("info@rslsolution.com")).thenReturn(Optional.of(existingUser));

		seeder.run();

		// Should NOT overwrite the password
		verify(adminRepository, never()).save(any(Admin.class));
		verify(userRepository, never()).save(any(User.class));
	}
}
