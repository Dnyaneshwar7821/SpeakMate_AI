package com.rslsolution.speakmateai.assistant.provider;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.ClassRoom;
import com.rslsolution.speakmateai.entity.ClassStudent;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.TeacherStandardDivision;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.ClassStudentRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.TeacherStandardDivisionRepository;

/**
 * Class / grade / division performance. Super Admin + School Admin can see any
 * class in scope; Teachers only see classes they are assigned to (via
 * ClassRoom.teacherId and TeacherStandardDivision).
 */
@Component
public class ClassDataProvider implements AssistantDataProvider {

	private final ClassRoomRepository classRoomRepository;
	private final ClassStudentRepository classStudentRepository;
	private final StudentRepository studentRepository;
	private final ProgressRepository progressRepository;
	private final TeacherStandardDivisionRepository teacherStandardDivisionRepository;
	private final ObjectMapper objectMapper;

	public ClassDataProvider(ClassRoomRepository classRoomRepository,
			ClassStudentRepository classStudentRepository, StudentRepository studentRepository,
			ProgressRepository progressRepository,
			TeacherStandardDivisionRepository teacherStandardDivisionRepository, ObjectMapper objectMapper) {
		this.classRoomRepository = classRoomRepository;
		this.classStudentRepository = classStudentRepository;
		this.studentRepository = studentRepository;
		this.progressRepository = progressRepository;
		this.teacherStandardDivisionRepository = teacherStandardDivisionRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.CLASS_PERFORMANCE;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		List<ClassRoom> classes = resolveClasses(actor);
		if (classes.isEmpty()) {
			Map<String, Object> empty = new LinkedHashMap<>();
			empty.put("message", "NO DATA");
			empty.put("reason", "No classes in the caller's scope.");
			return toJson(empty);
		}

		ClassRoom target = pickClass(classes, params);
		List<ClassStudent> memberships = classStudentRepository.findByClassId(target.getId());
		List<Long> studentIds = memberships.stream()
				.map(ClassStudent::getStudentId)
				.collect(Collectors.toList());

		Map<String, Object> data = new LinkedHashMap<>();
		data.put("scope", "CLASS (id=" + target.getId() + ")");
		data.put("className", target.getName());
		data.put("grade", target.getGrade());
		data.put("division", target.getDivision());
		data.put("academicYear", target.getAcademicYear());
		data.put("status", target.getStatus() != null ? target.getStatus().name() : "UNKNOWN");
		data.put("studentCount", studentIds.size());

		if (!studentIds.isEmpty()) {
			List<Student> students = studentRepository.findAllById(studentIds);
			List<Progress> progresses = students.stream()
					.map(s -> progressRepository.findByStudent(s).orElse(null))
					.filter(p -> p != null)
					.collect(Collectors.toList());

			long withStreak = progresses.stream().filter(p -> p.getCurrentStreak() != null && p.getCurrentStreak() > 0).count();
			int totalXp = progresses.stream().mapToInt(p -> p.getXp() == null ? 0 : p.getXp()).sum();
			long totalPracticeMinutes = progresses.stream()
					.mapToLong(p -> p.getTotalPracticeMinutes() == null ? 0L : p.getTotalPracticeMinutes().longValue())
					.sum();
			double avgPracticeMinutes = progresses.isEmpty() ? 0.0
					: (double) totalPracticeMinutes / progresses.size();

			data.put("studentsWithActiveStreak", withStreak);
			data.put("totalXp", totalXp);
			data.put("averagePracticeMinutesPerStudent", avgPracticeMinutes);
			data.put("averageXpPerStudent", progresses.isEmpty() ? 0 : totalXp / progresses.size());
		} else {
			data.put("studentsWithActiveStreak", 0);
			data.put("totalXp", 0);
			data.put("averagePracticeMinutesPerStudent", 0);
			data.put("averageXpPerStudent", 0);
		}

		List<String> available = classes.stream().limit(10)
				.map(ClassRoom::getName)
				.collect(Collectors.toList());
		data.put("availableClasses", available);
		return toJson(data);
	}

	private List<ClassRoom> resolveClasses(ActorContext actor) {
		if (actor.getRole() == Role.TEACHER && actor.getTeacherId() != null) {
			List<ClassRoom> byTeacher = classRoomRepository.findByTeacherId(actor.getTeacherId());
			if (!byTeacher.isEmpty()) {
				return byTeacher;
			}
			// Fall back to classes linked via TeacherStandardDivision. A ClassRoom does
			// not persist a division id (only a grade string + division letter), so the
			// teacher's assigned StandardDivision rows are compared as (standard,
			// division) pairs against each class's (grade, division) - never by id, and
			// never by inventing an id the model does not store.
			Set<String> assignedStandardDivisions = teacherStandardDivisionRepository
					.findByTeacherId(actor.getTeacherId()).stream()
					.map(TeacherStandardDivision::getStandardDivision)
					.filter(Objects::nonNull)
					.map(sd -> standardDivisionKey(
							sd.getSchoolStandard() == null ? null : sd.getSchoolStandard().getStandard(),
							sd.getDivision()))
					.collect(Collectors.toSet());
			if (assignedStandardDivisions.isEmpty()) {
				return List.of();
			}
			return classRoomRepository.findBySchoolId(actor.getSchoolId() == null ? -1L : actor.getSchoolId()).stream()
					.filter(c -> assignedStandardDivisions.contains(standardDivisionKey(c.getGrade(), c.getDivision())))
					.collect(Collectors.toList());
		}
		if (actor.getSchoolId() != null) {
			return classRoomRepository.findBySchoolId(actor.getSchoolId());
		}
		// Super Admin without a school filter: list all classes (bounded for safety).
		return classRoomRepository.findAll().stream().limit(200).collect(Collectors.toList());
	}

	// Matches a class by the classifier params; falls back to the first in scope.
	private ClassRoom pickClass(List<ClassRoom> classes, Map<String, Object> params) {
		String className = strParam(params, "className");
		String grade = strParam(params, "grade");
		String division = strParam(params, "division");

		Optional<ClassRoom> byName = classes.stream()
				.filter(c -> !className.isEmpty() && c.getName() != null
						&& c.getName().equalsIgnoreCase(className))
				.findFirst();
		if (byName.isPresent()) {
			return byName.get();
		}

		Optional<ClassRoom> byGradeDivision = classes.stream()
				.filter(c -> (!grade.isEmpty() && c.getGrade() != null && c.getGrade().equalsIgnoreCase(grade))
						&& (division.isEmpty() || (c.getDivision() != null && c.getDivision().equalsIgnoreCase(division))))
				.findFirst();
		return byGradeDivision.orElse(classes.get(0));
	}

	/**
		* Builds the (standard, division) comparison key shared by a teacher's assigned
		* StandardDivision and a ClassRoom. Standards may be stored as "1st", "Grade 1"
		* or "1", so both sides are normalised to the same token before comparison.
		*/
	private static String standardDivisionKey(String standard, String division) {
		String normalizedStandard = normalizeStandard(standard);
		String normalizedDivision = division == null ? "" : division.trim().toUpperCase(Locale.ROOT);
		return normalizedStandard + "|" + normalizedDivision;
	}

	private static String normalizeStandard(String value) {
		if (value == null) {
			return "";
		}
		String trimmed = value.trim();
		if (trimmed.isEmpty()) {
			return "";
		}
		// Prefer the numeric token: "Grade 1", "1st", "Class 2" all reduce to "1"/"2".
		Matcher digits = Pattern.compile("\\d+").matcher(trimmed);
		if (digits.find()) {
			return digits.group();
		}
		// Otherwise strip standard/grade/class words and ordinal suffixes.
		return trimmed.toLowerCase(Locale.ROOT)
				.replaceAll("(?i)standard|grade|class", "")
				.replaceAll("(?i)th|st|nd|rd", "")
				.replaceAll("\\s+", "");
	}

	private String strParam(Map<String, Object> params, String key) {
		Object v = params.get(key);
		return v == null ? "" : v.toString().trim();
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
