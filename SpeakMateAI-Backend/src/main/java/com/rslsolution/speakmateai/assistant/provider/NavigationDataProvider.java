package com.rslsolution.speakmateai.assistant.provider;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.enums.Role;

/**
 * Navigation help. Produces a role-aware list of frontend pages (routes) the
 * caller can visit, plus the current route if provided. Routes are hardcoded
 * from the frontend route constants so the assistant never exposes internal URLs.
 */
@Component
public class NavigationDataProvider implements AssistantDataProvider {

	private final ObjectMapper objectMapper;

	public NavigationDataProvider(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.NAVIGATION_HELP;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Map<String, Object> data = new LinkedHashMap<>();
		data.put("scope", "NAVIGATION");
		data.put("role", actor.getRole() != null ? actor.getRole().name() : "USER");
		data.put("pages", pagesFor(actor.getRole()));
		Object currentRoute = params.get("currentRoute");
		if (currentRoute != null) {
			data.put("currentRoute", currentRoute.toString());
		}
		return toJson(data);
	}

	private List<Map<String, String>> pagesFor(Role role) {
		if (role == null) {
			return List.of();
		}
		return switch (role) {
			case SUPER_ADMIN -> List.of(
					page("Dashboard", "/admin/dashboard"),
					page("Insights / Analytics", "/admin/insights"),
					page("User management", "/admin/users"),
					page("School users", "/admin/school-users"),
					page("Add school", "/admin/add-school"),
					page("Teachers", "/admin/teachers"),
					page("Subscriptions & Billing", "/admin/subscription"),
					page("Profile", "/admin/profile"),
					page("Settings", "/admin/settings"),
					page("Notifications", "/admin/notifications"));
			case SCHOOL_ADMIN -> List.of(
					page("Dashboard", "/school-admin/dashboard"),
					page("Students", "/school-admin/students"),
					page("Teachers", "/school-admin/teachers"),
					page("Results", "/school-admin/results"),
					page("Insights / Analytics", "/school-admin/insights"),
					page("Profile", "/school-admin/profile"),
					page("Settings", "/school-admin/settings"));
			case TEACHER -> List.of(
					page("Dashboard", "/teacher/dashboard"),
					page("Analytics", "/teacher/analytics"),
					page("Students", "/teacher/students"),
					page("Student details", "/teacher/students/:studentId"),
					page("Reports", "/teacher/reports"),
					page("Profile", "/teacher/profile"),
					page("Settings", "/teacher/settings"));
			default -> List.of(
					page("Home", "/dashboard"),
					page("Progress", "/progress"),
					page("Lessons", "/lessons"),
					page("Speaking", "/speaking"),
					page("Grammar", "/grammar"),
					page("Vocabulary", "/vocabulary"),
					page("Profile", "/profile"),
					page("Settings", "/settings"));
		};
	}

	private Map<String, String> page(String label, String route) {
		Map<String, String> m = new LinkedHashMap<>();
		m.put("label", label);
		m.put("route", route);
		return m;
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}

	@SuppressWarnings("unused")
	private String summarizePages(List<Map<String, String>> pages) {
		return pages.stream()
				.map(p -> p.get("label") + " (" + p.get("route") + ")")
				.collect(Collectors.joining(", "));
	}
}
