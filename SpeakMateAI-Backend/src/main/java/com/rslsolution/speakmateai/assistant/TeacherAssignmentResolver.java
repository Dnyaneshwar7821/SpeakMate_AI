package com.rslsolution.speakmateai.assistant;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.rslsolution.speakmateai.entity.ClassRoom;
import com.rslsolution.speakmateai.entity.ClassStudent;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.TeacherStandardDivision;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.ClassStudentRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.TeacherStandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

/**
 * Resolves all students assigned to a Teacher across every allocation mechanism
 * supported by SpeakMate AI:
 * <ol>
 *   <li>Direct assignment via {@code Student.teacherId}</li>
 *   <li>Class memberships via {@link ClassRoom} and {@link ClassStudent}</li>
 *   <li>Standard & division mappings via {@link TeacherStandardDivision}</li>
 *   <li>Teacher's direct standard and division attributes on the User entity</li>
 * </ol>
 *
 * <p>Guarantees that a teacher querying their students in the AI Assistant sees
 * the exact same roster visible in the Teacher Web Portal.
 */
@Component
public class TeacherAssignmentResolver {

	private final StudentRepository studentRepository;
	private final UserRepository userRepository;
	private final ClassRoomRepository classRoomRepository;
	private final ClassStudentRepository classStudentRepository;
	private final TeacherStandardDivisionRepository teacherStandardDivisionRepository;

	public TeacherAssignmentResolver(StudentRepository studentRepository,
			UserRepository userRepository,
			ClassRoomRepository classRoomRepository,
			ClassStudentRepository classStudentRepository,
			TeacherStandardDivisionRepository teacherStandardDivisionRepository) {
		this.studentRepository = studentRepository;
		this.userRepository = userRepository;
		this.classRoomRepository = classRoomRepository;
		this.classStudentRepository = classStudentRepository;
		this.teacherStandardDivisionRepository = teacherStandardDivisionRepository;
	}

	/**
	 * Resolves every student assigned to the given teacher within their school scope.
	 */
	public List<Student> resolveAssignedStudents(Long teacherId, Long schoolId) {
		if (teacherId == null) {
			return List.of();
		}

		Map<Long, Student> studentMap = new LinkedHashMap<>();

		// 1. Direct assignment via Student.teacherId
		List<Student> direct = studentRepository.findByTeacherId(teacherId);
		for (Student s : direct) {
			if (isValidStudent(s)) {
				studentMap.putIfAbsent(s.getId(), s);
			}
		}

		// 2. Class memberships: classes taught by this teacher -> class student memberships
		List<ClassRoom> teacherClasses = classRoomRepository.findByTeacherId(teacherId);
		if (!teacherClasses.isEmpty()) {
			List<Long> classIds = teacherClasses.stream()
					.map(ClassRoom::getId)
					.filter(Objects::nonNull)
					.collect(Collectors.toList());
			if (!classIds.isEmpty()) {
				List<ClassStudent> classStudents = classStudentRepository.findByClassIdIn(classIds);
				List<Long> studentIds = classStudents.stream()
						.map(ClassStudent::getStudentId)
						.filter(Objects::nonNull)
						.distinct()
						.collect(Collectors.toList());
				if (!studentIds.isEmpty()) {
					List<Student> rosterStudents = studentRepository.findAllById(studentIds);
					for (Student s : rosterStudents) {
						if (isValidStudent(s)) {
							studentMap.putIfAbsent(s.getId(), s);
						}
					}
				}
			}
		}

		// Load school students for standard/division matching if schoolId is known or can be resolved
		Long effectiveSchoolId = schoolId;
		if (effectiveSchoolId == null) {
			User teacherUser = userRepository.findById(teacherId).orElse(null);
			if (teacherUser != null) {
				effectiveSchoolId = teacherUser.getSchoolId();
			}
		}

		if (effectiveSchoolId != null) {
			List<Student> schoolStudents = studentRepository.findBySchoolId(effectiveSchoolId);

			// 3. Allocations via TeacherStandardDivision
			try {
				List<TeacherStandardDivision> teacherStdDivs = teacherStandardDivisionRepository.findByTeacherId(teacherId);
				for (TeacherStandardDivision tsd : teacherStdDivs) {
					if (tsd != null && tsd.getStandardDivision() != null
							&& tsd.getStandardDivision().getSchoolStandard() != null) {
						String assignedStd = tsd.getStandardDivision().getSchoolStandard().getStandard();
						String assignedDiv = tsd.getStandardDivision().getDivision();
						String normAssignedStd = normalizeStandard(assignedStd);
						String normAssignedDiv = assignedDiv != null ? assignedDiv.trim().toUpperCase(Locale.ROOT) : "";

						for (Student s : schoolStudents) {
							if (!isValidStudent(s)) {
								continue;
							}
							String sNormStd = normalizeStandard(s.getStandard());
							if (!normAssignedStd.isEmpty() && normAssignedStd.equals(sNormStd)) {
								String sDiv = s.getDivision() != null ? s.getDivision().trim().toUpperCase(Locale.ROOT) : "";
								if (normAssignedDiv.isEmpty() || normAssignedDiv.equals(sDiv)) {
									studentMap.putIfAbsent(s.getId(), s);
								}
							}
						}
					}
				}
			} catch (Exception ignored) {
				// Defensive fallback
			}

			// 4. Allocations via Teacher's own standard and division attributes
			User teacherUser = userRepository.findById(teacherId).orElse(null);
			if (teacherUser != null && teacherUser.getStandard() != null && !teacherUser.getStandard().trim().isEmpty()) {
				String normTeacherStd = normalizeStandard(teacherUser.getStandard());
				String normTeacherDiv = teacherUser.getDivision() != null ? teacherUser.getDivision().trim().toUpperCase(Locale.ROOT) : "";

				for (Student s : schoolStudents) {
					if (!isValidStudent(s)) {
						continue;
					}
					String sNormStd = normalizeStandard(s.getStandard());
					if (!normTeacherStd.isEmpty() && normTeacherStd.equals(sNormStd)) {
						String sDiv = s.getDivision() != null ? s.getDivision().trim().toUpperCase(Locale.ROOT) : "";
						if (normTeacherDiv.isEmpty() || normTeacherDiv.equals(sDiv)) {
							studentMap.putIfAbsent(s.getId(), s);
						}
					}
				}
			}
		}

		return new ArrayList<>(studentMap.values());
	}

	/**
	 * Finds a specific assigned student matching the query parameters (name, email, roll number, id).
	 */
	public Optional<Student> findAssignedStudent(Long teacherId, Long schoolId, Map<String, Object> params) {
		List<Student> candidates = resolveAssignedStudents(teacherId, schoolId);
		if (candidates.isEmpty()) {
			return Optional.empty();
		}

		String name = strParam(params, "studentName");
		if (name.isEmpty()) {
			name = strParam(params, "name");
		}
		String email = strParam(params, "studentEmail");
		if (email.isEmpty()) {
			email = strParam(params, "email");
		}
		if (email.isEmpty() && name.contains("@")) {
			email = name;
			name = "";
		}

		String studentIdParam = strParam(params, "studentId");
		String rollNumber = strParam(params, "rollNumber");
		String idValue = !studentIdParam.isEmpty() ? studentIdParam : rollNumber;

		// 1. Match by email
		if (!email.isEmpty()) {
			String finalEmail = email.toLowerCase(Locale.ROOT);
			Optional<Student> byEmail = candidates.stream()
					.filter(s -> s.getEmail() != null && s.getEmail().toLowerCase(Locale.ROOT).equals(finalEmail))
					.findFirst();
			if (byEmail.isPresent()) {
				return byEmail;
			}
		}

		// 2. Match by studentId / rollNumber
		if (!idValue.isEmpty()) {
			Optional<Student> byId = candidates.stream()
					.filter(s -> (s.getStudentId() != null && s.getStudentId().equalsIgnoreCase(idValue))
							|| (s.getRollNumber() != null && s.getRollNumber().equalsIgnoreCase(idValue))
							|| String.valueOf(s.getId()).equalsIgnoreCase(idValue))
					.findFirst();
			if (byId.isPresent()) {
				return byId;
			}
		}

		// 3. Match by Name (exact or substring)
		if (!name.isEmpty()) {
			String needle = name.toLowerCase(Locale.ROOT).trim();
			// Exact full name match first
			Optional<Student> exact = candidates.stream()
					.filter(s -> fullName(s).toLowerCase(Locale.ROOT).equals(needle))
					.findFirst();
			if (exact.isPresent()) {
				return exact;
			}

			// Substring match in full name
			Optional<Student> substring = candidates.stream()
					.filter(s -> fullName(s).toLowerCase(Locale.ROOT).contains(needle)
							|| needle.contains(fullName(s).toLowerCase(Locale.ROOT)))
					.findFirst();
			if (substring.isPresent()) {
				return substring;
			}

			// Match first name + last name tokens
			String[] tokens = needle.split("\\s+");
			if (tokens.length >= 2) {
				Optional<Student> tokenMatch = candidates.stream()
						.filter(s -> {
							String fn = s.getFirstName() != null ? s.getFirstName().toLowerCase(Locale.ROOT) : "";
							String ln = s.getLastName() != null ? s.getLastName().toLowerCase(Locale.ROOT) : "";
							return (fn.contains(tokens[0]) && ln.contains(tokens[1]))
									|| (fn.contains(tokens[1]) && ln.contains(tokens[0]));
						})
						.findFirst();
				if (tokenMatch.isPresent()) {
					return tokenMatch;
				}
			} else if (tokens.length == 1 && !tokens[0].isBlank()) {
				// Single name match (e.g. "Siddhi")
				Optional<Student> singleMatch = candidates.stream()
						.filter(s -> {
							String fn = s.getFirstName() != null ? s.getFirstName().toLowerCase(Locale.ROOT) : "";
							String ln = s.getLastName() != null ? s.getLastName().toLowerCase(Locale.ROOT) : "";
							return fn.equalsIgnoreCase(tokens[0]) || ln.equalsIgnoreCase(tokens[0]);
						})
						.findFirst();
				if (singleMatch.isPresent()) {
					return singleMatch;
				}
			}
		}

		return Optional.empty();
	}

	public static String normalizeStandard(String value) {
		if (value == null) {
			return "";
		}
		String trimmed = value.trim();
		if (trimmed.isEmpty()) {
			return "";
		}
		Matcher digits = Pattern.compile("\\d+").matcher(trimmed);
		if (digits.find()) {
			return digits.group();
		}
		return trimmed.toLowerCase(Locale.ROOT)
				.replaceAll("(?i)standard|grade|class", "")
				.replaceAll("(?i)th|st|nd|rd", "")
				.replaceAll("\\s+", "");
	}

	private boolean isValidStudent(Student s) {
		return s != null && s.getId() != null && s.getRole() == Role.STUDENT;
	}

	private String fullName(Student s) {
		String first = s.getFirstName() != null ? s.getFirstName() : "";
		String last = s.getLastName() != null ? s.getLastName() : "";
		return (first + " " + last).trim();
	}

	private String strParam(Map<String, Object> params, String key) {
		if (params == null) {
			return "";
		}
		Object v = params.get(key);
		return v == null ? "" : v.toString().trim();
	}
}
