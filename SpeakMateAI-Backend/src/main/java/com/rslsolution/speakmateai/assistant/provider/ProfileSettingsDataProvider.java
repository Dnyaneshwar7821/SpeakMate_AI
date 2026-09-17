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
import com.rslsolution.speakmateai.entity.Settings;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SettingsRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

/**
 * Answers questions about the caller's own <b>Profile</b> and <b>Settings</b>
 * pages: their profile details (name, email, phone, school, department, joined
 * date) and their saved preferences (theme, notifications, language, voice,
 * two-factor status).
 *
 * <p>Read-only and strictly limited to the authenticated caller's own data —
 * no other user's profile is ever queried.
 */
@Component
public class ProfileSettingsDataProvider implements AssistantDataProvider {

	private final UserRepository userRepository;
	private final SchoolRepository schoolRepository;
	private final SettingsRepository settingsRepository;
	private final ObjectMapper objectMapper;

	public ProfileSettingsDataProvider(UserRepository userRepository, SchoolRepository schoolRepository,
			SettingsRepository settingsRepository, ObjectMapper objectMapper) {
		this.userRepository = userRepository;
		this.schoolRepository = schoolRepository;
		this.settingsRepository = settingsRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.PROFILE_SETTINGS;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Map<String, Object> data = new LinkedHashMap<>();
		if (actor == null || actor.getEmail() == null) {
			data.put("message", "NO DATA");
			data.put("reason", "Authenticated caller context is missing.");
			return toJson(data);
		}
		Optional<User> maybeUser = userRepository.findByEmail(actor.getEmail());
		if (maybeUser.isEmpty() && actor.getUserId() != null) {
			maybeUser = userRepository.findById(actor.getUserId());
		}
		if (maybeUser.isEmpty()) {
			data.put("message", "NO DATA");
			data.put("reason", "The caller's own profile could not be found.");
			return toJson(data);
		}
		User user = maybeUser.get();

		data.put("scope", "SELF (own profile and settings only)");
		data.put("name", fullName(user));
		data.put("email", user.getEmail());
		data.put("role", user.getRole() != null ? user.getRole().name().replace('_', ' ') : null);
		if (user.getPhone() != null && !user.getPhone().isBlank()) {
			data.put("phone", user.getPhone());
		}
		if (user.getCreatedAt() != null) {
			data.put("joinedAt", user.getCreatedAt().toString());
		}
		data.put("department", departmentFor(user));

		Long schoolId = user.getSchoolId() != null ? user.getSchoolId() : actor.getSchoolId();
		if (schoolId != null) {
			School school = schoolRepository.findById(schoolId).orElse(null);
			if (school != null) {
				String schoolName = school.getName() != null && !school.getName().isBlank()
						? school.getName()
						: school.getSchoolName();
				data.put("schoolName", schoolName);
				if (school.getSchoolCode() != null) {
					data.put("schoolCode", school.getSchoolCode());
				}
				if (school.getAddress() != null) {
					data.put("schoolAddress", school.getAddress());
				}
			} else if (user.getSchoolName() != null) {
				data.put("schoolName", user.getSchoolName());
			}
		} else if (user.getSchoolName() != null) {
			data.put("schoolName", user.getSchoolName());
		}

		if (user.getStandard() != null && !user.getStandard().isBlank()) {
			data.put("standard", user.getStandard());
		}
		if (user.getDivision() != null && !user.getDivision().isBlank()) {
			data.put("division", user.getDivision());
		}
		if (user.getRollNumber() != null && !user.getRollNumber().isBlank()) {
			data.put("rollNumber", user.getRollNumber());
		}

		Optional<Settings> maybeSettings = settingsRepository.findByUser(user);
		if (maybeSettings.isPresent()) {
			Settings s = maybeSettings.get();
			data.put("settingsSource", "saved");
			data.put("darkMode", s.getDarkMode());
			data.put("notificationsEnabled", s.getNotificationsEnabled());
			data.put("language", s.getLanguage());
			data.put("aiVoice", s.getAiVoice());
			data.put("soundEffects", s.getSoundEffects());
			data.put("autoPlayAudio", s.getAutoPlayAudio());
			data.put("dailyReminder", s.getDailyReminder());
			data.put("twoFactorEnabled", Boolean.FALSE);
		} else {
			data.put("settingsSource", "defaults");
			data.put("darkMode", Boolean.FALSE);
			data.put("notificationsEnabled", Boolean.TRUE);
			data.put("language", "English");
			data.put("aiVoice", "Female");
			data.put("soundEffects", Boolean.TRUE);
			data.put("autoPlayAudio", Boolean.TRUE);
			data.put("dailyReminder", Boolean.TRUE);
			data.put("twoFactorEnabled", Boolean.FALSE);
			data.put("settingsNote", "No custom settings have been saved yet, so the app defaults are shown.");
		}
		return toJson(data);
	}

	private String departmentFor(User user) {
		if (user.getRole() == null) {
			return "Not specified";
		}
		return switch (user.getRole()) {
			case SCHOOL_ADMIN -> "School Administration";
			case SUPER_ADMIN -> "Platform Administration";
			case TEACHER -> "Teaching";
			case STUDENT -> "Student";
			default -> "General";
		};
	}

	private String fullName(User user) {
		String first = user.getFirstName() != null ? user.getFirstName() : "";
		String last = user.getLastName() != null ? user.getLastName() : "";
		String name = (first + " " + last).trim();
		return name.isEmpty() ? "User" : name;
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
