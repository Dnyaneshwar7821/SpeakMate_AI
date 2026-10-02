package com.rslsolution.speakmateai.assistant.provider;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

/**
 * Platform-wide user directory (Super Admin only, enforced by the registry).
 *
 * <p>Answers name/list questions about every account on the platform
 * ("names of all users", "list all users", "who are the users") with the REAL
 * records the All Users page ({@code /admin/users}) shows: name, role, email,
 * school and status. Before this provider existed such questions were classified
 * outside the Super Admin's scope and answered with an access-denied message even
 * though the Super Admin can access every dataset in the web app.
 *
 * <p>A Super Admin may also narrow the list to a single role via
 * {@code params.role} ("list all teachers"); the search is case-insensitive and
 * silently ignored when the value is not a known role.
 */
@Component
public class PlatformUsersDataProvider implements AssistantDataProvider {

	private static final DateTimeFormatter REG_DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

	private final UserRepository userRepository;
	private final SchoolRepository schoolRepository;
	private final ObjectMapper objectMapper;

	public PlatformUsersDataProvider(UserRepository userRepository, SchoolRepository schoolRepository, ObjectMapper objectMapper) {
		this.userRepository = userRepository;
		this.schoolRepository = schoolRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.PLATFORM_USERS;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Role roleFilter = parseRole(strParam(params, "roleFilter"));
		if (roleFilter == null) {
			roleFilter = parseRole(strParam(params, "role"));
		}
		if (roleFilter == null) {
			roleFilter = parseRole(strParam(params, "userRole"));
		}
		final Role filter = roleFilter;

		Map<Long, String> schoolNameById = new HashMap<>();
		if (schoolRepository != null) {
			for (School s : schoolRepository.findAll()) {
				if (s.getId() != null) {
					String sName = s.getSchoolName() != null && !s.getSchoolName().isBlank() ? s.getSchoolName() : s.getName();
					if (sName != null && !sName.isBlank()) {
						schoolNameById.put(s.getId(), sName.trim());
					}
				}
			}
		}

		List<User> all;
		if (actor != null && (actor.getRole() == Role.SCHOOL_ADMIN || actor.getRole() == Role.TEACHER)) {
			Long schoolId = actor.getSchoolId();
			all = (schoolId != null) ? userRepository.findBySchoolId(schoolId) : List.of();
		} else {
			all = userRepository.findAll();
		}

		List<User> selected = filter == null
				? all
				: all.stream().filter(u -> matchesRole(u.getRole(), filter)).collect(Collectors.toList());

		// Optional school filter for Super Admin (e.g., "who is school admin of DY Patil University")
		String requestedSchool = (actor != null && (actor.getRole() == Role.SCHOOL_ADMIN || actor.getRole() == Role.TEACHER))
				? ""
				: strParam(params, "schoolName").trim();
		if (!requestedSchool.isEmpty()) {
			selected = selected.stream().filter(u -> {
				String sName = resolveSchoolName(u, schoolNameById);
				return sName != null && sName.toLowerCase(Locale.ROOT).contains(requestedSchool.toLowerCase(Locale.ROOT));
			}).collect(Collectors.toList());
		}

		// Stable, readable ordering: by role, then by name.
		List<User> ordered = new ArrayList<>(selected);
		ordered.sort(Comparator
				.comparingInt((User u) -> u.getRole() == null ? Integer.MAX_VALUE : u.getRole().ordinal())
				.thenComparing(u -> fullName(u.getFirstName(), u.getLastName()), String.CASE_INSENSITIVE_ORDER));

		List<Map<String, Object>> views = ordered.stream().map(u -> userView(u, schoolNameById)).collect(Collectors.toList());

		// Recently added users (sorted by createdAt descending, fallback to id descending)
		List<Map<String, Object>> recentViews = selected.stream()
				.sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
						.thenComparing(User::getId, Comparator.nullsLast(Comparator.reverseOrder())))
				.limit(5)
				.map(u -> userView(u, schoolNameById))
				.collect(Collectors.toList());

		long teacherCount = all.stream().filter(u -> u.getRole() == Role.TEACHER).count();
		long studentCount = all.stream().filter(u -> u.getRole() == Role.STUDENT).count();
		long schoolAdminCount = all.stream().filter(u -> u.getRole() == Role.SCHOOL_ADMIN || u.getRole() == Role.ADMIN).count();
		long superAdminCount = all.stream().filter(u -> u.getRole() == Role.SUPER_ADMIN).count();
		long learnerCount = all.stream().filter(u -> u.getRole() == Role.USER).count();

		Map<String, Object> data = new LinkedHashMap<>();
		data.put("scope", "PLATFORM (all users)");
		data.put("totalUsers", all.size());
		data.put("totalTeachers", teacherCount);
		data.put("totalStudents", studentCount);
		data.put("totalSchoolAdmins", schoolAdminCount);
		data.put("totalSuperAdmins", superAdminCount);
		data.put("totalLearners", learnerCount);
		data.put("userCount", views.size());
		data.put("roleFilter", roleFilter == null ? "" : roleLabel(roleFilter));
		if (!requestedSchool.isEmpty()) {
			data.put("schoolFilter", requestedSchool);
		}
		data.put("users", views);
		data.put("recentUsers", recentViews);
		data.put("usersText", views.size() + " user" + (views.size() == 1 ? "" : "s"));
		data.put("roleCounts", roleCounts(all));
		data.put("summary", roleFilter == null
				? "The platform has " + all.size() + " user" + (all.size() == 1 ? "" : "s") + "."
				: "The platform has " + views.size() + " " + roleLabel(roleFilter)
						+ (views.size() == 1 ? "" : "s") + ".");
		return toJson(data);
	}

	private boolean matchesRole(Role userRole, Role filter) {
		if (userRole == null || filter == null) {
			return false;
		}
		if (userRole == filter) {
			return true;
		}
		if ((filter == Role.SCHOOL_ADMIN || filter == Role.ADMIN)
				&& (userRole == Role.SCHOOL_ADMIN || userRole == Role.ADMIN)) {
			return true;
		}
		return false;
	}

	private String resolveSchoolName(User user, Map<Long, String> schoolNameById) {
		if (user == null) {
			return null;
		}
		String sName = user.getSchoolName();
		if ((sName == null || sName.isBlank()) && user.getSchoolId() != null && schoolNameById != null) {
			sName = schoolNameById.get(user.getSchoolId());
		}
		return sName != null && !sName.isBlank() ? sName : null;
	}

	/**
	 * One directory entry: the base profile fields that live on {@link User}.
	 * Only real, stored values are emitted so the synthesizer never has to say a
	 * detail is unavailable for a record it received.
	 */
	private Map<String, Object> userView(User user, Map<Long, String> schoolNameById) {
		Map<String, Object> view = new LinkedHashMap<>();
		String name = fullName(user.getFirstName(), user.getLastName());
		view.put("name", name.isBlank() ? "(no name)" : name);
		if (user.getRole() != null) {
			view.put("role", roleLabel(user.getRole()));
		}
		putIfPresent(view, "email", user.getEmail());
		putIfPresent(view, "schoolName", resolveSchoolName(user, schoolNameById));
		putIfPresent(view, "phone", user.getPhone());
		if (user.getCreatedAt() != null) {
			view.put("createdAt", user.getCreatedAt().toString());
			view.put("registeredDate", user.getCreatedAt().format(REG_DATE_FMT));
		}
		view.put("status", user.isActive() ? "Active" : "Inactive");
		return view;
	}

	private Map<String, Object> roleCounts(List<User> users) {
		Map<String, Object> counts = new LinkedHashMap<>();
		for (Role role : Role.values()) {
			long count = users.stream().filter(u -> u.getRole() == role).count();
			counts.put(roleLabel(role), count);
		}
		return counts;
	}

	/** "SUPER_ADMIN" -> "Super Admin"; unknown/blank values return null. */
	private Role parseRole(String raw) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		String normalized = raw.trim().toUpperCase(Locale.ROOT).replace(' ', '_').replace('-', '_');
		if (normalized.endsWith("S")) {
			normalized = normalized.substring(0, normalized.length() - 1);
		}
		if ("ADMIN".equals(normalized)) {
			return Role.SCHOOL_ADMIN;
		}
		if ("LEARNER".equals(normalized)) {
			return Role.USER;
		}
		for (Role role : Role.values()) {
			if (role.name().equals(normalized)) {
				return role;
			}
		}
		return null;
	}

	private String roleLabel(Role role) {
		if (role == null) {
			return "";
		}
		String[] parts = role.name().toLowerCase(Locale.ROOT).split("_");
		StringBuilder sb = new StringBuilder();
		for (String part : parts) {
			if (part.isEmpty()) {
				continue;
			}
			if (sb.length() > 0) {
				sb.append(' ');
			}
			sb.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1));
		}
		return sb.toString();
	}

	private void putIfPresent(Map<String, Object> view, String key, String value) {
		if (value != null && !value.isBlank()) {
			view.put(key, value);
		}
	}

	private String fullName(String first, String last) {
		String f = first != null ? first : "";
		String l = last != null ? last : "";
		return (f + " " + l).trim();
	}

	private String strParam(Map<String, Object> params, String key) {
		if (params == null) {
			return "";
		}
		Object value = params.get(key);
		return value == null ? "" : value.toString();
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
