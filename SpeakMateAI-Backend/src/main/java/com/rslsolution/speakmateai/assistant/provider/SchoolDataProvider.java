package com.rslsolution.speakmateai.assistant.provider;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.SchoolStandard;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SchoolStandardRepository;
import com.rslsolution.speakmateai.repository.StandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

/**
 * School-level overview. Super Admins can query any school by name; School Admins
 * are always scoped to their own school (registry-enforced role matrix).
 * All aggregates use cheap COUNT queries - never full-entity selects just for .size().
 */
@Component
public class SchoolDataProvider implements AssistantDataProvider {

	private final SchoolRepository schoolRepository;
	private final UserRepository userRepository;
	private final ClassRoomRepository classRoomRepository;
	private final SchoolStandardRepository schoolStandardRepository;
	private final StandardDivisionRepository standardDivisionRepository;
	private final ObjectMapper objectMapper;

	public SchoolDataProvider(SchoolRepository schoolRepository, UserRepository userRepository,
			ClassRoomRepository classRoomRepository, SchoolStandardRepository schoolStandardRepository,
			StandardDivisionRepository standardDivisionRepository, ObjectMapper objectMapper) {
		this.schoolRepository = schoolRepository;
		this.userRepository = userRepository;
		this.classRoomRepository = classRoomRepository;
		this.schoolStandardRepository = schoolStandardRepository;
		this.standardDivisionRepository = standardDivisionRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.SCHOOL_OVERVIEW;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		School school = resolveSchool(actor, params);
		if (school == null) {
			Map<String, Object> empty = new LinkedHashMap<>();
			empty.put("message", "NO DATA");
			empty.put("availableSchools", availableSchoolNames());
			return toJson(empty);
		}

		Long schoolId = school.getId();
		long totalStudents = userRepository.countByRoleAndSchoolId(Role.STUDENT, schoolId);
		long totalTeachers = userRepository.countByRoleAndSchoolId(Role.TEACHER, schoolId);
		long totalSchoolAdmins = userRepository.countByRoleAndSchoolId(Role.SCHOOL_ADMIN, schoolId);
		long activeStudents = userRepository.countByRoleAndSchoolIdAndActiveTrue(Role.STUDENT, schoolId);
		long activeTeachers = userRepository.countByRoleAndSchoolIdAndActiveTrue(Role.TEACHER, schoolId);
		long totalClasses = classRoomRepository.countBySchoolId(schoolId);
		long totalStandards = schoolStandardRepository.countBySchoolId(schoolId);
		long totalDivisions = standardDivisionRepository.countBySchoolId(schoolId);
		Map<String, Object> data = new LinkedHashMap<>();
		data.put("scope", "SCHOOL (id=" + schoolId + ")");
		data.put("schoolName", school.getSchoolName() != null ? school.getSchoolName() : school.getName());
		data.put("schoolCode", school.getSchoolCode());
		data.put("active", school.isActive());
		// Explicit zero-safe fields so the LLM never says "data not available" for a
		// school that exists but has no enrolled members yet.
		data.put("hasStudents", totalStudents > 0);
		data.put("hasTeachers", totalTeachers > 0);
		data.put("totalStudents", totalStudents);
		data.put("totalTeachers", totalTeachers);
		data.put("totalSchoolAdmins", totalSchoolAdmins);
		data.put("activeStudents", activeStudents);
		data.put("activeTeachers", activeTeachers);
		data.put("totalClasses", totalClasses);
		data.put("totalStandards", totalStandards);
		data.put("totalDivisions", totalDivisions);
		data.put("studentsText", totalStudents + " student" + (totalStudents == 1 ? "" : "s"));
		data.put("teachersText", totalTeachers + " teacher" + (totalTeachers == 1 ? "" : "s"));
		data.put("schoolAdminsText", totalSchoolAdmins + " school admin" + (totalSchoolAdmins == 1 ? "" : "s"));
		data.put("classesText", totalClasses + " class" + (totalClasses == 1 ? "" : "es"));
		data.put("standardsText", totalStandards + " standard" + (totalStandards == 1 ? "" : "s"));
		data.put("divisionsText", totalDivisions + " division" + (totalDivisions == 1 ? "" : "s"));
		data.put("summary", (school.getSchoolName() != null ? school.getSchoolName() : school.getName())
				+ " currently has " + totalStudents + " student" + (totalStudents == 1 ? "" : "s")
				+ " and " + totalTeachers + " teacher" + (totalTeachers == 1 ? "" : "s")
				+ " enrolled.");
		List<String> standards = schoolStandardRepository.findBySchoolId(schoolId).stream()
				.map(SchoolStandard::getStandard)
				.collect(Collectors.toList());
		data.put("standards", standards);
		return toJson(data);
	}

	private School resolveSchool(ActorContext actor, Map<String, Object> params) {
		if (actor.getRole() == Role.SCHOOL_ADMIN && actor.getSchoolId() != null) {
			return schoolRepository.findById(actor.getSchoolId()).orElse(null);
		}
		Object name = params.get("schoolName");
		if (name == null || name.toString().isBlank()) {
			return null;
		}
		String raw = name.toString().trim();
		String exactKey = schoolKey(raw);
		if (exactKey.isEmpty()) {
			return null;
		}
		// 1) Exact match (existing behavior).
		Optional<School> exact = schoolRepository.findByName(raw);
		if (exact.isPresent()) {
			return exact.get();
		}
		// 2) Case-insensitive exact match — PostgreSQL '=' is case-sensitive.
		List<School> all = schoolRepository.findAll();
		Optional<School> byExactIgnoreCase = all.stream()
				.filter(s -> schoolKey(displayName(s)).equals(exactKey))
				.findFirst();
		if (byExactIgnoreCase.isPresent()) {
			return byExactIgnoreCase.get();
		}
		// 3) Normalized contains match so partial or alternate school names still
		//    resolve. The key strips spaces and punctuation, so a query typed with
		//    word boundaries resolves to the stored concatenated form and vice
		//    versa: "Ekvira High School" -> "ekvirahighschool" == "Ekvira
		//    Highschool"; "St. Vincent High School" -> "stvincenthighschool" ==
		//    "St.Vincent High School"; "Greenwood High" is a prefix of "Greenwood
		//    High School" (previously a spaced "Ekvira High School" never matched
		//    the stored "Ekvira Highschool", producing a NO DATA reply).
		return all.stream()
				.filter(s -> {
					String full = schoolKey(displayName(s));
					String shortName = schoolKey(s.getName());
					return full.contains(exactKey) || exactKey.contains(full)
							|| (!shortName.isEmpty()
									&& (shortName.contains(exactKey) || exactKey.contains(shortName)));
				})
				.findFirst()
				.orElse(null);
	}

	/**
	 * Normalizes a school name for matching: lower-cased with all whitespace and
	 * punctuation removed, so "St. Vincent High School" and "St.Vincent
	 * Highschool" collapse to the same key. Only alphanumerics survive.
	 */
	private String schoolKey(String value) {
		if (value == null) {
			return "";
		}
		return value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
	}

	private String displayName(School school) {
		return school.getSchoolName() != null ? school.getSchoolName() : school.getName();
	}

	private List<String> availableSchoolNames() {
		return schoolRepository.findAll().stream()
				.map(this::displayName)
				.collect(Collectors.toList());
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
