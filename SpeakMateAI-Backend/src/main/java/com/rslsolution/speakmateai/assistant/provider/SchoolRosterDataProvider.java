package com.rslsolution.speakmateai.assistant.provider;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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
import com.rslsolution.speakmateai.assistant.TeacherAssignmentResolver;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.SchoolStandard;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.Teacher;
import com.rslsolution.speakmateai.entity.TeacherStandardDivision;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.TeacherRepository;
import com.rslsolution.speakmateai.repository.TeacherStandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

/**
 * School roster provider: returns the actual DETAILS of teachers and/or students
 * (names, email, phone, department/subject, designation, experience,
 * qualification, employee id, join date and assigned classes for teachers;
 * standard, division, student id and assigned teacher for students) so questions
 * like "name of the teacher", "which department is Digvijay Patil in", "which
 * subject does he teach" or "when did he join the school" get a real answer
 * instead of "not available".
 *
 * <p>Scoping (registry-enforced role matrix):
 * <ul>
 *   <li>Super Admin - any school, resolved from the school name in the question;</li>
 *   <li>School Admin - always their own school;</li>
 *   <li>Teacher - only their own assigned students (no other school data).</li>
 * </ul>
 */
@Component
public class SchoolRosterDataProvider implements AssistantDataProvider {

	private static final DateTimeFormatter JOINED_DATE = DateTimeFormatter.ofPattern("dd MMM yyyy");

	private final SchoolRepository schoolRepository;
	private final UserRepository userRepository;
	private final StudentRepository studentRepository;
	private final TeacherRepository teacherRepository;
	private final TeacherStandardDivisionRepository teacherStandardDivisionRepository;
	private final TeacherAssignmentResolver teacherAssignmentResolver;
	private final ObjectMapper objectMapper;

	public SchoolRosterDataProvider(SchoolRepository schoolRepository, UserRepository userRepository,
			StudentRepository studentRepository, TeacherRepository teacherRepository,
			TeacherStandardDivisionRepository teacherStandardDivisionRepository,
			TeacherAssignmentResolver teacherAssignmentResolver,
			ObjectMapper objectMapper) {
		this.schoolRepository = schoolRepository;
		this.userRepository = userRepository;
		this.studentRepository = studentRepository;
		this.teacherRepository = teacherRepository;
		this.teacherStandardDivisionRepository = teacherStandardDivisionRepository;
		this.teacherAssignmentResolver = teacherAssignmentResolver;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.SCHOOL_ROSTER;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		// Teachers see ONLY their own assigned students.
		if (actor.getRole() == Role.TEACHER && actor.getTeacherId() != null) {
			List<Student> assigned = teacherAssignmentResolver.resolveAssignedStudents(actor.getTeacherId(), actor.getSchoolId());
			Map<String, Object> data = new LinkedHashMap<>();
			data.put("scope", "SELF (assigned students only)");
			data.put("entityType", "STUDENTS");
			data.put("studentCount", assigned.size());
			data.put("students", assigned.stream().map(this::studentView).collect(Collectors.toList()));
			data.put("studentsText", assigned.size() + " student" + (assigned.size() == 1 ? "" : "s") + " assigned to you");
			data.put("summary", "You are currently assigned " + assigned.size() + " student"
					+ (assigned.size() == 1 ? "" : "s") + ".");
			return toJson(data);
		}

		String focusName = strParam(params, "focusName").trim();
		School school = resolveSchool(actor, params);

		Long schoolId;
		List<User> teachers;
		List<Student> students;
		// Users whose role is neither STUDENT nor TEACHER (platform USERs, School
		// Admins, Admins). They have no roster/learning record but a real profile, so
		// a Super Admin asking about one by name must still get a data-backed answer.
		List<User> others;
		String schoolLabel;
		if (school != null) {
			schoolId = school.getId();
			schoolLabel = displayName(school);
			teachers = userRepository.findBySchoolIdAndRole(schoolId, Role.TEACHER);
			students = studentRepository.findBySchoolId(schoolId);
			others = nonStudentNonTeacherUsers(schoolId);
		} else if (actor.getRole() == Role.SUPER_ADMIN) {
			// Super-Admin question that names no school ("list of all students", "give me list student name",
			// or per-person "standard of Vijay Patil"): load every school's teachers/students and locate the
			// named person if specified, or return all records across the platform.
			schoolId = null;
			schoolLabel = "All schools";
			teachers = userRepository.findByRole(Role.TEACHER);
			students = studentRepository.findAll();
			others = nonStudentNonTeacherUsers(null);
		} else {
			Map<String, Object> empty = new LinkedHashMap<>();
			empty.put("message", "NO DATA");
			empty.put("availableSchools", availableSchoolNames());
			return toJson(empty);
		}

		String entityType = strParam(params, "entityType").toLowerCase(Locale.ROOT);
		boolean wantTeachers = !entityType.equals("students");
		boolean wantStudents = !entityType.equals("teachers");
		boolean wantOthers = wantTeachers && wantStudents;

		Map<Long, List<String>> classesByTeacher = wantTeachers
				? classesByTeacherIds(teachers.stream().map(t -> t.getId()).filter(java.util.Objects::nonNull).collect(Collectors.toList()))
				: Map.of();

		List<Map<String, Object>> teacherViews = wantTeachers
				? teachers.stream()
						.map(t -> teacherView(t, classesByTeacher.getOrDefault(t.getId(), List.of())))
						.collect(Collectors.toList())
				: List.of();
		List<Map<String, Object>> studentViews = wantStudents
				? students.stream().map(this::studentView).collect(Collectors.toList())
				: List.of();
		List<Map<String, Object>> otherViews = wantOthers
				? others.stream().map(this::otherUserView).collect(Collectors.toList())
				: List.of();

		// Narrow to one named person when the question asks about their stored
		// attributes ("which department is Digvijay Patil in", "which subject does
		// he teach", "when did he join the school"). Keeps the payload focused and
		// the answer unambiguous; falls back to the full roster when the name
		// matches nobody so a broad list question is never emptied by accident.
		if (!focusName.isBlank()) {
			boolean teacherMatch = matchesName(teacherViews, focusName);
			boolean studentMatch = matchesName(studentViews, focusName);
			boolean otherMatch = matchesName(otherViews, focusName);
			if (teacherMatch || studentMatch || otherMatch) {
				teacherViews = teacherMatch ? filterByName(teacherViews, focusName) : List.of();
				studentViews = studentMatch ? filterByName(studentViews, focusName) : List.of();
				otherViews = otherMatch ? filterByName(otherViews, focusName) : List.of();
				wantTeachers = teacherMatch;
				wantStudents = studentMatch;
				wantOthers = otherMatch;
			}
		}

		Map<String, Object> data = new LinkedHashMap<>();
		data.put("scope", schoolId == null ? "PLATFORM (all schools)" : "SCHOOL (id=" + schoolId + ")");
		data.put("schoolName", schoolLabel);
		if (focusName.isBlank()) {
			data.put("entityType", entityType.isBlank() ? "BOTH" : entityType.toUpperCase(Locale.ROOT));
		} else {
			data.put("entityType", "SINGLE_PERSON");
			data.put("focusName", focusName);
		}
		if (wantTeachers) {
			data.put("teacherCount", teacherViews.size());
			data.put("teachers", teacherViews);
			data.put("teachersText", teacherViews.size() + " teacher" + (teacherViews.size() == 1 ? "" : "s"));
		}
		if (wantStudents) {
			data.put("studentCount", studentViews.size());
			data.put("students", studentViews);
			data.put("studentsText", studentViews.size() + " student" + (studentViews.size() == 1 ? "" : "s"));
		}
		if (wantOthers) {
			data.put("otherUserCount", otherViews.size());
			data.put("otherUsers", otherViews);
			data.put("otherUsersText", otherViews.size() + " other user" + (otherViews.size() == 1 ? "" : "s"));
		}
		int shownTeachers = wantTeachers ? teacherViews.size() : 0;
		int shownStudents = wantStudents ? studentViews.size() : 0;
		int shownOthers = wantOthers ? otherViews.size() : 0;
		String summary;
		if (wantTeachers && !wantStudents) {
			summary = schoolLabel + " has " + shownTeachers + " teacher" + (shownTeachers == 1 ? "" : "s") + ".";
		} else if (wantStudents && !wantTeachers) {
			summary = schoolLabel + " has " + shownStudents + " student" + (shownStudents == 1 ? "" : "s") + ".";
		} else {
			summary = schoolLabel + " has " + shownTeachers + " teacher"
					+ (shownTeachers == 1 ? "" : "s") + " and " + shownStudents + " student"
					+ (shownStudents == 1 ? "" : "s") + ".";
		}
		if (shownOthers > 0 && shownTeachers == 0 && shownStudents == 0) {
			// The question narrowed onto a single non-teaching, non-student account (a
			// platform USER, School Admin or Admin). State who the person really is and
			// why a learning metric such as XP does not apply to them, instead of
			// degrading to the generic "information not available" reply.
			Map<String, Object> person = otherViews.get(0);
			StringBuilder focus = new StringBuilder(String.valueOf(person.get("name")))
					.append(" is a ").append(String.valueOf(person.getOrDefault("role", "User")))
					.append(" (not a student or teacher).");
			Object email = person.get("email");
			if (email != null && !email.toString().isBlank()) {
				focus.append(" Email: ").append(email).append('.');
			}
			focus.append(" XP, levels, streaks and lesson/activity metrics are recorded only")
					.append(" for student accounts, so there are no learning metrics for this user.");
			summary = focus.toString();
		}
		data.put("summary", summary);
		return toJson(data);
	}

	/**
	 * Full teacher profile: the base profile fields (name/email/phone) that live on
	 * {@link User}, every teacher-specific field present in the DB
	 * (department/designation/employeeId/experience/qualification/joinedAt) and the
	 * classes the teacher is assigned to. The teaching area is exposed twice - as
	 * {@code department} (its real column name) and as {@code subject} (the word
	 * users actually ask with).
	 *
	 * <p>Extra detail is loaded via {@link TeacherRepository} keyed by the user id.
	 * With JPA joined inheritance the {@code users} row and the {@code teachers} row
	 * share the same primary key, so the id match always works, and it does not rely
	 * on the {@code teachers.user_id} back-reference (which the live data leaves NULL).
	 */
	private Map<String, Object> teacherView(User teacher, List<String> assignedClasses) {
		Map<String, Object> view = new LinkedHashMap<>();
		String name = fullName(teacher.getFirstName(), teacher.getLastName());
		view.put("name", name);
		view.put("email", teacher.getEmail());
		putIfPresent(view, "phone", teacher.getPhone());
		putIfPresent(view, "schoolName", teacher.getSchoolName());
		if (assignedClasses != null && !assignedClasses.isEmpty()) {
			view.put("classes", assignedClasses);
		}

		Long teacherUserId = teacher.getId();
		Teacher details = teacherUserId != null ? teacherRepository.findById(teacherUserId).orElse(null) : null;
		if (details != null) {
			putIfPresent(view, "employeeId", details.getEmployeeId());
			putIfPresent(view, "department", details.getDepartment());
			// The word users ask with is "subject"; the stored column is "department".
			putIfPresent(view, "subject", details.getDepartment());
			putIfPresent(view, "designation", details.getDesignation());
			putIfPresent(view, "experience", details.getExperience());
			putIfPresent(view, "qualification", details.getQualification());
			if (details.getJoinedAt() != null) {
				view.put("joinedAt", JOINED_DATE.format(details.getJoinedAt()));
			}
		}
		return view;
	}

	/**
	 * Full student profile: base profile fields (name/email/phone) plus the
	 * student-specific fields present in the DB (studentId, standard, division)
	 * and the name of the teacher the student is assigned to.
	 */
	private Map<String, Object> studentView(Student student) {
		Map<String, Object> view = new LinkedHashMap<>();
		view.put("name", fullName(student.getFirstName(), student.getLastName()));
		view.put("email", student.getEmail());
		putIfPresent(view, "phone", student.getPhone());
		putIfPresent(view, "schoolName", student.getSchoolName());
		putIfPresent(view, "studentId", student.getStudentId());
		putIfPresent(view, "standard", student.getStandard());
		putIfPresent(view, "division", student.getDivision());
		putIfPresent(view, "rollNumber", student.getRollNumber());
		Long assignedTeacherId = student.getTeacherId();
		if (assignedTeacherId != null) {
			view.put("teacherId", assignedTeacherId);
			User assignedTeacher = userRepository.findById(assignedTeacherId).orElse(null);
			if (assignedTeacher != null) {
				view.put("assignedTeacher", fullName(assignedTeacher.getFirstName(), assignedTeacher.getLastName()));
			}
		}
		return view;
	}

	/**
	 * Teacher id -> the class labels ("5-A", "6-B") the teacher is assigned to,
	 * resolved through teacher_standard_divisions -> standard_divisions ->
	 * school_standards. Loaded in a single eager-fetch query to avoid N+1 and to
	 * keep the lazy associations out of the payload path; any failure degrades to
	 * "no classes" rather than breaking the roster answer.
	 */
	private Map<Long, List<String>> classesByTeacherIds(List<Long> teacherIds) {
		Map<Long, List<String>> grouped = new LinkedHashMap<>();
		if (teacherIds == null || teacherIds.isEmpty()) {
			return grouped;
		}
		List<TeacherStandardDivision> links;
		try {
			links = teacherStandardDivisionRepository.findWithClassesByTeacherIdIn(teacherIds);
		} catch (Exception e) {
			return grouped;
		}
		if (links == null || links.isEmpty()) {
			return grouped;
		}
		for (TeacherStandardDivision link : links) {
			if (link.getTeacher() == null || link.getStandardDivision() == null) {
				continue;
			}
			SchoolStandard schoolStandard = link.getStandardDivision().getSchoolStandard();
			String standard = schoolStandard != null ? schoolStandard.getStandard() : null;
			String label = joinStandardDivision(standard, link.getStandardDivision().getDivision());
			if (label.isBlank()) {
				continue;
			}
			List<String> labels = grouped.computeIfAbsent(link.getTeacher().getId(), k -> new ArrayList<>());
			if (!labels.contains(label)) {
				labels.add(label);
			}
		}
		return grouped;
	}

	private String joinStandardDivision(String standard, String division) {
		String s = standard == null ? "" : standard.trim();
		String d = division == null ? "" : division.trim();
		if (s.isEmpty()) {
			return d;
		}
		if (d.isEmpty()) {
			return s;
		}
		return s + "-" + d;
	}

	private boolean matchesName(List<Map<String, Object>> views, String focusName) {
		String needle = focusName.toLowerCase(Locale.ROOT);
		return views.stream().anyMatch(v -> hasNameMatch(v, needle));
	}

	private List<Map<String, Object>> filterByName(List<Map<String, Object>> views, String focusName) {
		String needle = focusName.toLowerCase(Locale.ROOT);
		return views.stream().filter(v -> hasNameMatch(v, needle)).collect(Collectors.toList());
	}

	private boolean hasNameMatch(Map<String, Object> view, String needleLower) {
		Object name = view.get("name");
		return name != null && name.toString().toLowerCase(Locale.ROOT).contains(needleLower);
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

	/**
	 * Users whose role is neither STUDENT nor TEACHER (platform USERs, School
	 * Admins, Admins). Their profile is real data a Super Admin may ask for even
	 * though they have no learning record. When {@code schoolId} is null every such
	 * user on the platform is returned.
	 */
	private List<User> nonStudentNonTeacherUsers(Long schoolId) {
		return userRepository.findAll().stream()
				.filter(u -> u.getRole() != Role.STUDENT && u.getRole() != Role.TEACHER)
				.filter(u -> schoolId == null || schoolId.equals(u.getSchoolId()))
				.collect(Collectors.toList());
	}

	/**
	 * Profile view for a user who is neither a teacher nor a student. Mirrors
	 * {@link #teacherView}/{@link #studentView} so a named non-teaching person still
	 * renders as a real person block instead of degrading to "not available".
	 */
	private Map<String, Object> otherUserView(User u) {
		Map<String, Object> view = new LinkedHashMap<>();
		view.put("name", fullName(u.getFirstName(), u.getLastName()));
		view.put("role", roleLabel(u.getRole()));
		view.put("email", u.getEmail());
		putIfPresent(view, "phone", u.getPhone());
		putIfPresent(view, "schoolName", u.getSchoolName());
		putIfPresent(view, "status", u.isActive() ? "Active" : "Inactive");
		return view;
	}

	private String roleLabel(Role role) {
		if (role == null) {
			return "User";
		}
		return switch (role) {
			case SUPER_ADMIN -> "Super Admin";
			case SCHOOL_ADMIN -> "School Admin";
			case ADMIN -> "Admin";
			case TEACHER -> "Teacher";
			case STUDENT -> "Student";
			case USER -> "User";
		};
	}

	/**
	 * Finds the one school that holds the named teacher/student. Used for a
	 * Super-Admin per-person detail question ("standard of Vijay Patil") that does
	 * not name a school: the person is located across every school so the answer
	 * comes from real data instead of degrading to a generic NO DATA reply.
	 * Teacher matches win over student matches; returns {@code null} when the
	 * person exists in no school.
	 */
	private School findPersonAcrossSchools(String focusName) {
		if (focusName == null || focusName.isBlank()) {
			return null;
		}
		String needle = focusName.toLowerCase(Locale.ROOT);
		for (School school : schoolRepository.findAll()) {
			List<User> teachers = userRepository.findBySchoolIdAndRole(school.getId(), Role.TEACHER);
			if (containsName(teachers.stream().map(this::personName).collect(Collectors.toList()), needle)) {
				return school;
			}
		}
		for (School school : schoolRepository.findAll()) {
			List<Student> students = studentRepository.findBySchoolId(school.getId());
			if (containsName(students.stream().map(this::personName).collect(Collectors.toList()), needle)) {
				return school;
			}
		}
		// Also locate named platform users / School Admins so a non-teaching person
		// is resolved to their school rather than reported as "not found".
		for (School school : schoolRepository.findAll()) {
			List<User> others = nonStudentNonTeacherUsers(school.getId());
			if (containsName(others.stream().map(this::personName).collect(Collectors.toList()), needle)) {
				return school;
			}
		}
		return null;
	}

	private String personName(User user) {
		return fullName(user.getFirstName(), user.getLastName());
	}

	private boolean containsName(List<String> names, String needleLower) {
		return names.stream().anyMatch(name -> name.toLowerCase(Locale.ROOT).contains(needleLower));
	}

	/**
	 * True when a name extracted from the question looks like a SCHOOL rather than
	 * a person (it shares a word with a school's name/short name). Prevents
	 * "students of Podar" from being treated as a named person.
	 */
	private boolean looksLikeSchoolName(String value) {
		if (value == null || value.isBlank()) {
			return false;
		}
		String needle = schoolKey(value);
		if (needle.isEmpty()) {
			return false;
		}
		return schoolRepository.findAll().stream().anyMatch(s -> {
			String full = schoolKey(displayName(s));
			String shortName = schoolKey(s.getName());
			return full.contains(needle) || needle.contains(full)
					|| (!shortName.isEmpty() && (shortName.contains(needle) || needle.contains(shortName)));
		});
	}

	private School resolveSchool(ActorContext actor, Map<String, Object> params) {
		Long adminSchoolId = actor.getSchoolId();
		if (actor.getRole() == Role.SCHOOL_ADMIN && adminSchoolId != null) {
			return schoolRepository.findById(adminSchoolId).orElse(null);
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
		// "standard of Vijay Patil" captures the PERSON name after "of". A Super
		// Admin question that names a person (and no school) must still resolve -
		// locate the school that actually holds that person instead of returning
		// null, which would collapse to a generic NO DATA reply.
		if (actor.getRole() == Role.SUPER_ADMIN && !looksLikeSchoolName(raw)) {
			School personSchool = findPersonAcrossSchools(raw);
			if (personSchool != null) {
				return personSchool;
			}
		}
		// 1) Exact match.
		Optional<School> exact = schoolRepository.findByName(raw);
		if (exact.isPresent()) {
			return exact.get();
		}
		// 2) Case-insensitive exact match - PostgreSQL '=' is case-sensitive.
		List<School> all = schoolRepository.findAll();
		Optional<School> byExactIgnoreCase = all.stream()
				.filter(s -> schoolKey(displayName(s)).equals(exactKey))
				.findFirst();
		if (byExactIgnoreCase.isPresent()) {
			return byExactIgnoreCase.get();
		}
		// 3) Normalized contains match for partial or alternate names. The key
		//    strips spaces and punctuation, so "Ekvira High School" resolves to the
		//    stored "Ekvira Highschool" and "St. Vincent High School" to
		//    "St.Vincent High School".
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
