package com.rslsolution.speakmateai.assistant.provider;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
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

	private final UserRepository userRepository;
	private final ObjectMapper objectMapper;

	public PlatformUsersDataProvider(UserRepository userRepository, ObjectMapper objectMapper) {
		this.userRepository = userRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.PLATFORM_USERS;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Role roleFilter = parseRole(strParam(params, "role"));
		if (roleFilter == null) {
			roleFilter = parseRole(strParam(params, "userRole"));
		}
		final Role filter = roleFilter;

		List<User> all = userRepository.findAll();
		List<User> selected = filter == null
				? all
				: all.stream().filter(u -> u.getRole() == filter).collect(Collectors.toList());

		// Stable, readable ordering: by role, then by name.
		List<User> ordered = new ArrayList<>(selected);
		ordered.sort(Comparator
				.comparingInt((User u) -> u.getRole() == null ? Integer.MAX_VALUE : u.getRole().ordinal())
				.thenComparing(u -> fullName(u.getFirstName(), u.getLastName()), String.CASE_INSENSITIVE_ORDER));

		List<Map<String, Object>> views = ordered.stream().map(this::userView).collect(Collectors.toList());

		Map<String, Object> data = new LinkedHashMap<>();
		data.put("scope", "PLATFORM (all users)");
		data.put("totalUsers", all.size());
		data.put("userCount", views.size());
		data.put("roleFilter", roleFilter == null ? "" : roleLabel(roleFilter));
		data.put("users", views);
		data.put("usersText", views.size() + " user" + (views.size() == 1 ? "" : "s"));
		data.put("roleCounts", roleCounts(all));
		data.put("summary", roleFilter == null
				? "The platform has " + all.size() + " user" + (all.size() == 1 ? "" : "s") + "."
				: "The platform has " + views.size() + " " + roleLabel(roleFilter)
						+ (views.size() == 1 ? "" : "s") + ".");
		return toJson(data);
	}

	/**
	 * One directory entry: the base profile fields that live on {@link User}.
	 * Only real, stored values are emitted so the synthesizer never has to say a
	 * detail is unavailable for a record it received.
	 */
	private Map<String, Object> userView(User user) {
		Map<String, Object> view = new LinkedHashMap<>();
		String name = fullName(user.getFirstName(), user.getLastName());
		view.put("name", name.isBlank() ? "(no name)" : name);
		if (user.getRole() != null) {
			view.put("role", roleLabel(user.getRole()));
		}
		putIfPresent(view, "email", user.getEmail());
		putIfPresent(view, "schoolName", user.getSchoolName());
		putIfPresent(view, "phone", user.getPhone());
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
