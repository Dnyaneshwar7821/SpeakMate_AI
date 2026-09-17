package com.rslsolution.speakmateai.assistant.provider;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.repository.SchoolRepository;

/**
 * Answers questions about the authenticated caller's OWN account/identity
 * ("what is my logged-in email?", "who am I?", "my role", "my school",
 * "my phone", "my joined date").
 *
 * <p>The data comes from the already-resolved {@link ActorContext} plus the
 * caller's own school (when scoped). No sensitive profile data and no other
 * user's data is ever queried or exposed — a caller can only ever see their
 * own account, and no DB write is performed.
 */
@Component
public class AccountInfoDataProvider implements AssistantDataProvider {

	private final SchoolRepository schoolRepository;
	private final ObjectMapper objectMapper;

	public AccountInfoDataProvider(SchoolRepository schoolRepository, ObjectMapper objectMapper) {
		this.schoolRepository = schoolRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.ACCOUNT_INFO;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Map<String, Object> data = new LinkedHashMap<>();
		if (actor == null) {
			data.put("message", "NO DATA");
			data.put("reason", "Authenticated caller context is missing.");
			return toJson(data);
		}
		data.put("scope", "SELF (own account only)");
		data.put("email", actor.getEmail());
		data.put("displayName", actor.getDisplayName());
		data.put("role", actor.getRole() != null ? actor.getRole().name() : null);
		if (actor.getUserId() != null) {
			data.put("userId", actor.getUserId());
		}
		if (actor.getSchoolId() != null) {
			data.put("schoolId", actor.getSchoolId());
		}
		if (actor.getTeacherId() != null) {
			data.put("teacherId", actor.getTeacherId());
		}
		if (actor.getStudentId() != null) {
			data.put("studentId", actor.getStudentId());
		}
		if (actor.getAdminId() != null) {
			data.put("adminId", actor.getAdminId());
		}
		// "my phone" / "my joined date": the caller's OWN contact number and join
		// date, carried on the resolved ActorContext (users row for school
		// admins/teachers/students, admins row for the Super Admin). Own-account
		// data only — never another user's.
		if (actor.getPhone() != null && !actor.getPhone().isBlank()) {
			data.put("phone", actor.getPhone());
		}
		if (actor.getJoinedAt() != null && !actor.getJoinedAt().isBlank()) {
			data.put("joinedAt", actor.getJoinedAt());
		}

		String schoolName = null;
		String schoolAddress = null;
		if (actor.getSchoolId() != null) {
			Optional<School> school = schoolRepository.findById(actor.getSchoolId());
			if (school.isPresent()) {
				School s = school.get();
				schoolName = displayName(s);
				data.put("schoolName", schoolName);
				schoolAddress = s.getAddress();
				if (schoolAddress != null && !schoolAddress.isBlank()) {
					data.put("schoolAddress", schoolAddress);
				}
			}
		}
		// "my location": the caller's own location for a Super Admin comes from the
		// admins row; a school-scoped caller has no location of their own, so fall
		// back to their school's address. Either way this is the caller's OWN
		// location — no other user's or other school's data is ever exposed.
		String location = actor.getLocation();
		if (location == null || location.isBlank()) {
			location = schoolAddress;
		}
		if (location != null && !location.isBlank()) {
			data.put("location", location);
		}
		data.put("summary", accountSummary(actor, schoolName, location));
		return toJson(data);
	}

	private String accountSummary(ActorContext actor, String schoolName, String location) {
		String role = actor.getRole() != null ? actor.getRole().name().replace('_', ' ') : "user";
		StringBuilder sb = new StringBuilder();
		if (actor.getDisplayName() != null && !actor.getDisplayName().isBlank()) {
			sb.append("You are logged in as ").append(actor.getDisplayName()).append(" (a ").append(role).append(")");
		} else {
			sb.append("You are logged in as a ").append(role);
		}
		if (actor.getEmail() != null) {
			sb.append(" with email ").append(actor.getEmail());
		}
		if (schoolName != null) {
			sb.append(" at ").append(schoolName);
		}
		if (location != null && !location.isBlank()) {
			sb.append(" based in ").append(location);
		}
		return sb.append(".").toString();
	}

	private String displayName(School school) {
		return school.getSchoolName() != null ? school.getSchoolName() : school.getName();
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
