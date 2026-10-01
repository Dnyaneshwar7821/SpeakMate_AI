package com.rslsolution.speakmateai.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.rslsolution.speakmateai.entity.Admin;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.repository.AdminRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;
	private final AdminRepository adminRepository;

	public CustomUserDetailsService(UserRepository userRepository, AdminRepository adminRepository) {
		this.userRepository = userRepository;
		this.adminRepository = adminRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

		String cleanEmail = email != null ? email.trim().toLowerCase() : "";
		User user = userRepository.findByEmailIgnoreCase(cleanEmail)
				.orElseGet(() -> userRepository.findByEmail(email).orElse(null));

		if (user != null) {
			boolean isSuperAdmin = user.getRole() == com.rslsolution.speakmateai.enums.Role.SUPER_ADMIN;
			boolean isUserActive = isSuperAdmin || (user.isActive() && user.getStatus() != com.rslsolution.speakmateai.enums.Status.INACTIVE);
			return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
					.password(user.getPassword())
					.disabled(!isUserActive)
					.roles(user.getRole().name())
					.build();
		}

		Admin admin = adminRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

		boolean isSuperAdmin = admin.getRole() == com.rslsolution.speakmateai.enums.Role.SUPER_ADMIN;
		boolean isAdminActive = isSuperAdmin || (admin.getStatus() == com.rslsolution.speakmateai.enums.AdminStatus.ACTIVE);
		return org.springframework.security.core.userdetails.User.withUsername(admin.getEmail())
				.password(admin.getPassword())
				.disabled(!isAdminActive)
				.roles(admin.getRole().name())
				.build();
	}
}