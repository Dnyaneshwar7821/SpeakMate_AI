package com.rslsolution.speakmateai.assistant;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.rslsolution.speakmateai.entity.Admin;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.AdminRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

/**
 * Resolves the authenticated principal (an email from the JWT/security context)
 * into an {@link ActorContext} with role + scope ids.
 *
 * <p>Mirrors {@code CustomUserDetailsService}: the users table (JOINED inheritance:
 * school admins / teachers / students) is checked first, then the admins table
 * (Super Admin). Resolution is strictly read-only.
 */
@Component
public class ActorResolver {

	private static final DateTimeFormatter JOINED_DATE =
			DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);

	private final UserRepository userRepository;
	private final AdminRepository adminRepository;

	public ActorResolver(UserRepository userRepository, AdminRepository adminRepository) {
		this.userRepository = userRepository;
		this.adminRepository = adminRepository;
	}

	public ActorContext resolve(String email) {
		Optional<User> user = userRepository.findByEmail(email);
		Optional<Admin> admin = adminRepository.findByEmail(email);
		if (user.isPresent()) {
			User u = user.get();
			Role role = u.getRole() != null ? u.getRole() : Role.USER;
			// A Super Admin can legitimately have BOTH a users row and an admins
			// row. The users row is authoritative for identity/scope, but the
			// portal Profile page reads/writes the admins row, so profile-only
			// fields (phone, location, created_at) can be present there while
			// NULL on the users row (verified: users.phone = NULL while
			// admins.phone = 9087654323 for admin@speakmate.ai). Fall back to the
			// admins row for any account detail the users row lacks, otherwise
			// "my phone number" answers "I don't have your phone number" even
			// though the Profile page displays it.
			Admin fallback = (role == Role.ADMIN || role == Role.SUPER_ADMIN) ? admin.orElse(null) : null;
			return ActorContext.builder()
					.email(email)
					.role(role)
					.userId(u.getId())
					.schoolId(u.getSchoolId())
					.teacherId(role == Role.TEACHER ? u.getId() : null)
					.studentId(role == Role.STUDENT ? u.getId() : null)
					.displayName(displayName(u.getFirstName(), u.getLastName()))
					.phone(firstNonBlank(u.getPhone(), adminPhone(fallback)))
					.location(fallback != null ? fallback.getLocation() : null)
					.joinedAt(firstNonBlank(joinedAt(u.getCreatedAt()),
							fallback != null ? joinedAt(fallback.getCreatedAt()) : null))
					.build();
		}

		if (admin.isPresent()) {
			Admin a = admin.get();
			return ActorContext.builder()
					.email(email)
					.role(a.getRole() != null ? a.getRole() : Role.SUPER_ADMIN)
					.adminId(a.getId())
					.displayName(a.getFullName() != null ? a.getFullName() : email)
					// The Super Admin's location lives on the admins row (the same
					// value the Profile page reads/writes). School-scoped callers have
					// no location of their own and fall back to their school address,
					// resolved later by AccountInfoDataProvider.
					.location(a.getLocation())
					.phone(a.getPhone())
					.joinedAt(joinedAt(a.getCreatedAt()))
					.build();
		}

		throw new IllegalStateException("Authenticated principal could not be resolved: " + email);
	}

	private String adminPhone(Admin fallback) {
		return fallback != null ? fallback.getPhone() : null;
	}

	private String firstNonBlank(String primary, String fallback) {
		return (primary != null && !primary.isBlank()) ? primary : fallback;
	}

	private String joinedAt(LocalDateTime createdAt) {
		return createdAt == null ? null : createdAt.format(JOINED_DATE);
	}

	private String displayName(String first, String last) {
		if (first == null && last == null) {
			return "User";
		}
		if (first == null) {
			return last;
		}
		if (last == null) {
			return first;
		}
		return first + " " + last;
	}
}
