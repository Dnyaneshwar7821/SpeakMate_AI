package com.rslsolution.speakmateai.assistant.provider;

import java.util.Comparator;
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
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.SchoolStandard;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SchoolStandardRepository;
import com.rslsolution.speakmateai.repository.StandardDivisionRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
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
	private final StudentRepository studentRepository;
	private final ProgressRepository progressRepository;
	private final ObjectMapper objectMapper;

	public SchoolDataProvider(SchoolRepository schoolRepository, UserRepository userRepository,
			ClassRoomRepository classRoomRepository, SchoolStandardRepository schoolStandardRepository,
			StandardDivisionRepository standardDivisionRepository,
			StudentRepository studentRepository, ProgressRepository progressRepository,
			ObjectMapper objectMapper) {
		this.schoolRepository = schoolRepository;
		this.userRepository = userRepository;
		this.classRoomRepository = classRoomRepository;
		this.schoolStandardRepository = schoolStandardRepository;
		this.standardDivisionRepository = standardDivisionRepository;
		this.studentRepository = studentRepository;
		this.progressRepository = progressRepository;
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
			String reqName = params != null && params.get("schoolName") != null ? params.get("schoolName").toString().trim() : "";
			if (actor != null && (actor.getRole() == Role.SCHOOL_ADMIN || actor.getRole() == Role.TEACHER)) {
				School ownSchool = actor.getSchoolId() != null ? schoolRepository.findById(actor.getSchoolId()).orElse(null) : null;
				if (ownSchool != null && !reqName.isBlank()) {
					String reqKey = schoolKey(reqName);
					String reqCore = coreSchoolKey(reqName);
					String ownKey = schoolKey(displayName(ownSchool));
					String ownCore = coreSchoolKey(displayName(ownSchool));
					String ownShort = schoolKey(ownSchool.getName());
					String ownShortCore = coreSchoolKey(ownSchool.getName());
					boolean matchesOwn = ownKey.contains(reqKey) || reqKey.contains(ownKey)
							|| (!ownShort.isEmpty() && (ownShort.contains(reqKey) || reqKey.contains(ownShort)))
							|| (!reqCore.isEmpty() && (ownCore.contains(reqCore) || reqCore.contains(ownCore)
									|| (!ownShortCore.isEmpty() && (ownShortCore.contains(reqCore) || reqCore.contains(ownShortCore)))));
					if (!matchesOwn) {
						empty.put("reason", "Access denied: You are only authorized to view data for your own school.");
						empty.put("availableSchools", List.of(displayName(ownSchool)));
						return toJson(empty);
					}
				}
			}
			if (!reqName.isBlank()) {
				empty.put("reason", "School not found");
				empty.put("requestedSchool", reqName);
				empty.put("availableSchools", availableSchoolNames());
			} else if (actor != null && (actor.getRole() == Role.SCHOOL_ADMIN || actor.getRole() == Role.TEACHER)) {
				empty.put("reason", "Access denied: You are only authorized to view data for your own school.");
				if (actor.getSchoolId() != null) {
					schoolRepository.findById(actor.getSchoolId()).ifPresent(s -> empty.put("availableSchools", List.of(displayName(s))));
				}
			} else {
				empty.put("availableSchools", availableSchoolNames());
			}
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

		if (studentRepository != null && progressRepository != null) {
			List<Student> students = studentRepository.findBySchoolId(schoolId);
			List<Map<String, Object>> topStudents = students.stream()
					.map(s -> {
						Progress p = progressRepository.findByStudent(s).orElse(null);
						Map<String, Object> sm = new LinkedHashMap<>();
						String name = (s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "");
						sm.put("name", name.trim().isEmpty() ? s.getEmail() : name.trim());
						sm.put("schoolName", s.getSchoolName() != null ? s.getSchoolName() : (school.getSchoolName() != null ? school.getSchoolName() : school.getName()));
						sm.put("standard", s.getStandard() != null ? s.getStandard() : "");
						sm.put("division", s.getDivision() != null ? s.getDivision() : "");
						sm.put("xp", p != null && p.getXp() != null ? p.getXp() : 0);
						sm.put("level", p != null && p.getLevel() != null ? p.getLevel() : 1);
						sm.put("streak", p != null && p.getCurrentStreak() != null ? p.getCurrentStreak() : 0);
						sm.put("practiceMinutes", p != null && p.getTotalPracticeMinutes() != null ? p.getTotalPracticeMinutes() : 0);
						return sm;
					})
					.sorted(Comparator.comparingInt((Map<String, Object> sm) -> (Integer) sm.get("xp")).reversed())
					.limit(10)
					.collect(Collectors.toList());
			data.put("topStudents", topStudents);
			if (!topStudents.isEmpty()) {
				data.put("bestStudent", topStudents.get(0));
			}
		}

		return toJson(data);
	}

	private School resolveSchool(ActorContext actor, Map<String, Object> params) {
		String reqName = params != null && params.get("schoolName") != null ? params.get("schoolName").toString().trim() : "";
		if (reqName.isEmpty() && params != null && params.get("school") != null) {
			reqName = params.get("school").toString().trim();
		}
		if (actor != null && (actor.getRole() == Role.SCHOOL_ADMIN || actor.getRole() == Role.TEACHER) && actor.getSchoolId() != null) {
			School ownSchool = schoolRepository.findById(actor.getSchoolId()).orElse(null);
			if (reqName.isEmpty()) {
				return ownSchool;
			}
			if (ownSchool != null) {
				String reqKey = schoolKey(reqName);
				String reqCore = coreSchoolKey(reqName);
				String ownKey = schoolKey(displayName(ownSchool));
				String ownCore = coreSchoolKey(displayName(ownSchool));
				String ownShort = schoolKey(ownSchool.getName());
				String ownShortCore = coreSchoolKey(ownSchool.getName());
				boolean matchesOwn = ownKey.contains(reqKey) || reqKey.contains(ownKey)
						|| (!ownShort.isEmpty() && (ownShort.contains(reqKey) || reqKey.contains(ownShort)))
						|| (!reqCore.isEmpty() && (ownCore.contains(reqCore) || reqCore.contains(ownCore)
								|| (!ownShortCore.isEmpty() && (ownShortCore.contains(reqCore) || reqCore.contains(ownShortCore)))));
				if (matchesOwn) {
					return ownSchool;
				}
				return null;
			}
		}
		Object name = params != null ? params.get("schoolName") : null;
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

	private String coreSchoolKey(String value) {
		if (value == null) {
			return "";
		}
		return value.toLowerCase(Locale.ROOT)
				.replaceAll("\\b(?:school|schools|public|high|highschool|academy|college|institute|university|international|convent|campus|polytechnic|vidyamandir|gurukul|vidyalaya)\\b", "")
				.replaceAll("[^a-z0-9]", "");
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
