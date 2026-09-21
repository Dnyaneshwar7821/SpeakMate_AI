package com.rslsolution.speakmateai.assistant.provider;

import java.util.Comparator;
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
import com.rslsolution.speakmateai.entity.SchoolStandard;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.TeacherStandardDivision;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import org.springframework.beans.factory.annotation.Autowired;

import com.rslsolution.speakmateai.assistant.TeacherAssignmentResolver;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.ClassStudentRepository;
import com.rslsolution.speakmateai.repository.LessonProgressRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.TeacherStandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

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
	private final UserRepository userRepository;
	private final ObjectMapper objectMapper;
	private final SpeakingSessionRepository speakingSessionRepository;
	private final LessonProgressRepository lessonProgressRepository;
	private final TeacherAssignmentResolver teacherAssignmentResolver;

	@Autowired
	public ClassDataProvider(ClassRoomRepository classRoomRepository,
			ClassStudentRepository classStudentRepository, StudentRepository studentRepository,
			ProgressRepository progressRepository,
			TeacherStandardDivisionRepository teacherStandardDivisionRepository,
			UserRepository userRepository,
			ObjectMapper objectMapper,
			SpeakingSessionRepository speakingSessionRepository,
			LessonProgressRepository lessonProgressRepository,
			TeacherAssignmentResolver teacherAssignmentResolver) {
		this.classRoomRepository = classRoomRepository;
		this.classStudentRepository = classStudentRepository;
		this.studentRepository = studentRepository;
		this.progressRepository = progressRepository;
		this.teacherStandardDivisionRepository = teacherStandardDivisionRepository;
		this.userRepository = userRepository;
		this.objectMapper = objectMapper;
		this.speakingSessionRepository = speakingSessionRepository;
		this.lessonProgressRepository = lessonProgressRepository;
		this.teacherAssignmentResolver = teacherAssignmentResolver;
	}

	public ClassDataProvider(ClassRoomRepository classRoomRepository,
			ClassStudentRepository classStudentRepository, StudentRepository studentRepository,
			ProgressRepository progressRepository,
			TeacherStandardDivisionRepository teacherStandardDivisionRepository,
			UserRepository userRepository,
			ObjectMapper objectMapper) {
		this(classRoomRepository, classStudentRepository, studentRepository, progressRepository,
				teacherStandardDivisionRepository, userRepository, objectMapper, null, null, null);
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

		Long schoolId = actor != null ? actor.getSchoolId() : null;
		List<Student> schoolStudents = schoolId != null ? studentRepository.findBySchoolId(schoolId) : List.of();

		// Compute per-class enrollment counts for all available/assigned classes
		List<Map<String, Object>> assignedClassesList = new java.util.ArrayList<>();
		for (ClassRoom cr : classes) {
			Map<String, Object> cMap = new LinkedHashMap<>();
			cMap.put("id", cr.getId());
			cMap.put("name", cr.getName());
			cMap.put("grade", cr.getGrade());
			cMap.put("division", cr.getDivision());

			List<ClassStudent> cm = classStudentRepository.findByClassId(cr.getId());
			long count;
			if (!cm.isEmpty()) {
				count = cm.size();
			} else {
				String gNorm = normalizeStandard(cr.getGrade());
				String dNorm = cr.getDivision() != null ? cr.getDivision().trim() : "";
				count = schoolStudents.stream().filter(s -> {
					String sStd = s.getStandard() != null ? normalizeStandard(s.getStandard()) : "";
					String sDiv = s.getDivision() != null ? s.getDivision().trim() : "";
					boolean matchGrade = !gNorm.isEmpty() && sStd.equalsIgnoreCase(gNorm);
					boolean matchDiv = dNorm.isEmpty() || sDiv.equalsIgnoreCase(dNorm);
					boolean matchTeacher = cr.getTeacherId() != null && cr.getTeacherId().equals(s.getTeacherId());
					return (matchGrade && matchDiv) || matchTeacher;
				}).count();
			}
			cMap.put("studentCount", count);
			assignedClassesList.add(cMap);
		}

		// Teacher's all assigned students across all classes
		List<Student> allAssigned = (actor != null && actor.getRole() == Role.TEACHER && teacherAssignmentResolver != null && actor.getTeacherId() != null)
				? teacherAssignmentResolver.resolveAssignedStudents(actor.getTeacherId(), actor.getSchoolId())
				: List.of();

		boolean specificClassRequested = hasSpecificClassFilter(params);
		ClassRoom target = pickClass(classes, params);
		List<ClassStudent> memberships = classStudentRepository.findByClassId(target.getId());
		List<Long> studentIds = memberships.stream()
				.map(cs -> cs.getStudentId())
				.collect(Collectors.toList());

		List<Student> students;
		if (!studentIds.isEmpty()) {
			students = studentRepository.findAllById(studentIds);
		} else {
			// In SpeakMate AI, students are primarily assigned by standard and division or teacher
			Long targetSchoolId = target.getSchoolId() != null ? target.getSchoolId() : (actor != null ? actor.getSchoolId() : null);
			List<Student> targetSchoolStudents = targetSchoolId != null ? studentRepository.findBySchoolId(targetSchoolId) : List.of();
			String targetNormGrade = normalizeStandard(target.getGrade());
			String targetNormDiv = target.getDivision() != null ? target.getDivision().trim() : "";

			students = targetSchoolStudents.stream()
					.filter(s -> {
						String sStd = s.getStandard() != null ? normalizeStandard(s.getStandard()) : "";
						String sDiv = s.getDivision() != null ? s.getDivision().trim() : "";
						boolean matchGrade = !targetNormGrade.isEmpty() && sStd.equalsIgnoreCase(targetNormGrade);
						boolean matchDiv = targetNormDiv.isEmpty() || sDiv.equalsIgnoreCase(targetNormDiv);
						boolean matchTeacher = target.getTeacherId() != null && target.getTeacherId().equals(s.getTeacherId());
						return (matchGrade && matchDiv) || matchTeacher;
					})
					.collect(Collectors.toList());
		}

		// When teacher asks a general question without specifying a class, evaluate across all their assigned students
		List<Student> evalStudents = (actor != null && actor.getRole() == Role.TEACHER && !specificClassRequested && !allAssigned.isEmpty())
				? allAssigned
				: students;

		Map<String, Object> data = new LinkedHashMap<>();
		data.put("scope", "CLASS (id=" + target.getId() + ")");
		data.put("className", target.getName());
		data.put("grade", target.getGrade());
		data.put("division", target.getDivision());
		data.put("academicYear", target.getAcademicYear());
		data.put("status", target.getStatus() != null ? target.getStatus().name() : "UNKNOWN");
		data.put("studentCount", students.size());
		data.put("totalStudentsAcrossClasses", !allAssigned.isEmpty() ? allAssigned.size() : students.size());
		data.put("assignedClassesList", assignedClassesList);
		data.put("totalAssignedClasses", classes.size());

		// Query speech evaluation scores for evalStudents
		List<Long> evalUserIds = evalStudents.stream().map(Student::getId).filter(Objects::nonNull).collect(Collectors.toList());
		Map<Long, double[]> speechScoresMap = new LinkedHashMap<>();
		if (speakingSessionRepository != null && !evalUserIds.isEmpty()) {
			try {
				List<Object[]> rows = speakingSessionRepository.findAverageScoresByUserIds(evalUserIds);
				if (rows != null) {
					for (Object[] r : rows) {
						if (r != null && r.length >= 6 && r[0] instanceof Long uId) {
							double overall = r[1] != null ? ((Number) r[1]).doubleValue() : 0.0;
							double pronun = r[2] != null ? ((Number) r[2]).doubleValue() : 0.0;
							double fluency = r[3] != null ? ((Number) r[3]).doubleValue() : 0.0;
							double grammar = r[4] != null ? ((Number) r[4]).doubleValue() : 0.0;
							double vocab = r[5] != null ? ((Number) r[5]).doubleValue() : 0.0;
							speechScoresMap.put(uId, new double[]{overall, pronun, fluency, grammar, vocab});
						}
					}
				}
			} catch (Exception ignored) {}
		}

		if (!students.isEmpty()) {
			List<Progress> progresses = students.stream()
					.map(s -> progressRepository.findByStudent(s).orElse(null))
					.filter(Objects::nonNull)
					.collect(Collectors.toList());

			long withStreak = progresses.stream().filter(p -> p.getCurrentStreak() != null && p.getCurrentStreak() > 0).count();
			int totalXp = progresses.stream().mapToInt(p -> p.getXp() == null ? 0 : p.getXp()).sum();
			long totalPracticeMinutes = progresses.stream()
					.mapToLong(p -> p.getTotalPracticeMinutes() == null ? 0L : p.getTotalPracticeMinutes().longValue())
					.sum();
			double avgPracticeMinutes = (double) totalPracticeMinutes / students.size();

			data.put("studentsWithActiveStreak", withStreak);
			data.put("totalXp", totalXp);
			data.put("averagePracticeMinutesPerStudent", avgPracticeMinutes);
			data.put("averageXpPerStudent", totalXp / students.size());
		} else {
			data.put("studentsWithActiveStreak", 0);
			data.put("totalXp", 0);
			data.put("averagePracticeMinutesPerStudent", 0);
			data.put("averageXpPerStudent", 0);
		}

		// Build student metrics and identify struggling / top performers
		List<Map<String, Object>> studentList = new java.util.ArrayList<>();
		List<Map<String, Object>> strugglingList = new java.util.ArrayList<>();
		List<Map<String, Object>> lowSpeakingList = new java.util.ArrayList<>();

		double totalClassSpeaking = 0;
		double totalClassFluency = 0;
		double totalClassPronun = 0;
		int scoredCount = 0;

		for (Student s : evalStudents) {
			Progress p = progressRepository.findByStudent(s).orElse(null);
			int xp = (p != null && p.getXp() != null) ? p.getXp() : 0;
			int streak = (p != null && p.getCurrentStreak() != null) ? p.getCurrentStreak() : 0;
			long lessonsCompleted = (lessonProgressRepository != null) ? lessonProgressRepository.countByUserIdAndCompletedTrue(s.getId()) : 0L;

			double[] scores = speechScoresMap.get(s.getId());
			double overall = scores != null ? Math.round(scores[0] * 10.0) / 10.0 : 0.0;
			double pronun = scores != null ? Math.round(scores[1] * 10.0) / 10.0 : 0.0;
			double fluency = scores != null ? Math.round(scores[2] * 10.0) / 10.0 : 0.0;

			if (overall > 0.0) {
				totalClassSpeaking += overall;
				totalClassFluency += fluency;
				totalClassPronun += pronun;
				scoredCount++;
			}

			String name = (s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "");
			String sName = name.trim().isEmpty() ? s.getEmail() : name.trim();

			Map<String, Object> sm = new LinkedHashMap<>();
			sm.put("id", s.getId());
			sm.put("name", sName);
			sm.put("standard", s.getStandard() != null ? s.getStandard() : "");
			sm.put("division", s.getDivision() != null ? s.getDivision() : "");
			sm.put("xp", xp);
			sm.put("streak", streak);
			sm.put("lessonsCompleted", lessonsCompleted);
			sm.put("speakingScore", overall);
			sm.put("fluencyScore", fluency);
			sm.put("pronunciationScore", pronun);
			studentList.add(sm);

			// Check struggling / intervention risk indicators
			List<String> riskFactors = new java.util.ArrayList<>();
			if (overall > 0.0 && overall < 50.0) {
				riskFactors.add("Low speaking score (" + overall + "%)");
			} else if (overall > 0.0 && overall < 65.0) {
				riskFactors.add("Needs speaking fluency practice (" + overall + "%)");
			}
			if (lessonsCompleted <= 2) {
				riskFactors.add("Only " + lessonsCompleted + " lesson" + (lessonsCompleted == 1 ? "" : "s") + " completed");
			}
			if (streak == 0) {
				riskFactors.add("Inactive practice streak");
			}
			if (xp < 500) {
				riskFactors.add("Low XP (" + xp + ")");
			}

			if (!riskFactors.isEmpty()) {
				Map<String, Object> st = new LinkedHashMap<>(sm);
				st.put("reason", String.join(", ", riskFactors));
				strugglingList.add(st);
			}

			if (overall > 0.0) {
				lowSpeakingList.add(sm);
			}
		}

		strugglingList.sort(Comparator.comparingDouble((Map<String, Object> m) -> {
			double sc = (Double) m.get("speakingScore");
			return sc > 0 ? sc : 999.0;
		}).thenComparingInt(m -> (Integer) m.get("xp")));

		lowSpeakingList.sort(Comparator.comparingDouble(m -> (Double) m.get("speakingScore")));
		studentList.sort(Comparator.comparingInt((Map<String, Object> m) -> (Integer) m.get("xp")).reversed());

		data.put("students", studentList);
		data.put("strugglingStudents", strugglingList);
		data.put("lowSpeakingStudents", lowSpeakingList);
		if (!studentList.isEmpty()) {
			data.put("topStudent", studentList.get(0));
			data.put("topStudents", studentList);
		}

		if (scoredCount > 0) {
			data.put("classAverageSpeakingScore", Math.round((totalClassSpeaking / scoredCount) * 10.0) / 10.0);
			data.put("classAverageFluencyScore", Math.round((totalClassFluency / scoredCount) * 10.0) / 10.0);
			data.put("classAveragePronunciationScore", Math.round((totalClassPronun / scoredCount) * 10.0) / 10.0);
		}

		String teacherName = "Not assigned";
		if (target.getTeacherId() != null) {
			teacherName = userRepository.findById(target.getTeacherId())
					.map(u -> (u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim())
					.orElse("Not assigned");
		}
		if ("Not assigned".equals(teacherName) && target.getSchoolId() != null) {
			List<User> schoolTeachers = userRepository.findBySchoolIdAndRole(target.getSchoolId(), Role.TEACHER);
			if (!schoolTeachers.isEmpty()) {
				List<Long> tIds = schoolTeachers.stream().map(User::getId).filter(Objects::nonNull).collect(Collectors.toList());
				try {
					List<TeacherStandardDivision> links = teacherStandardDivisionRepository.findWithClassesByTeacherIdIn(tIds);
					if (links != null) {
						String targetStd = normalizeStandard(target.getGrade());
						String targetDiv = target.getDivision() != null ? target.getDivision().trim() : "";
						for (TeacherStandardDivision link : links) {
							if (link.getTeacher() != null && link.getStandardDivision() != null) {
								SchoolStandard ss = link.getStandardDivision().getSchoolStandard();
								String std = ss != null ? ss.getStandard() : null;
								String div = link.getStandardDivision().getDivision();
								if (normalizeStandard(std).equalsIgnoreCase(targetStd)
										&& (targetDiv.isEmpty() || targetDiv.equalsIgnoreCase(div != null ? div.trim() : ""))) {
									teacherName = (link.getTeacher().getFirstName() + " " + (link.getTeacher().getLastName() != null ? link.getTeacher().getLastName() : "")).trim();
									break;
								}
							}
						}
					}
				} catch (Exception ignored) {}
			}
		}
		data.put("assignedTeacher", teacherName);

		String filter = strParam(params, "filter");
		String summary;
		if (params != null && Boolean.TRUE.equals(params.get("myClasses"))) {
			int totalS = !allAssigned.isEmpty() ? allAssigned.size() : students.size();
			summary = "You are currently assigned to " + classes.size() + " classes with " + totalS + " enrolled students.";
		} else if ("struggling".equalsIgnoreCase(filter)) {
			summary = "Found " + strugglingList.size() + " student" + (strugglingList.size() == 1 ? "" : "s") + " who may need additional support or practice.";
		} else {
			int studentCount = students.size();
			summary = "Class " + target.getName() + " (Grade " + target.getGrade()
					+ (target.getDivision() != null && !target.getDivision().isBlank() ? ", Division " + target.getDivision() : "") + ")"
					+ " has " + studentCount + " enrolled student" + (studentCount == 1 ? "" : "s") + "."
					+ " Assigned teacher: " + teacherName + "."
					+ (studentCount > 0 ? " Total XP: " + data.get("totalXp") + ", Average XP: " + data.get("averageXpPerStudent") + "." : "");
		}
		data.put("summary", summary);

		List<String> available = classes.stream()
				.map(ClassRoom::getName)
				.filter(Objects::nonNull)
				.distinct()
				.collect(Collectors.toList());
		data.put("availableClasses", available);
		data.put("assignedClasses", available);
		data.put("totalAssignedClasses", available.size());
		return toJson(data);
	}

	private boolean hasSpecificClassFilter(Map<String, Object> params) {
		if (params == null || params.isEmpty()) {
			return false;
		}
		String className = strParam(params, "className");
		String grade = strParam(params, "grade");
		String standard = strParam(params, "standard");
		String division = strParam(params, "division");
		return !className.isEmpty() || !grade.isEmpty() || !standard.isEmpty() || !division.isEmpty();
	}

	private Comparator<ClassRoom> classRoomComparator() {
		return Comparator
				.comparing((ClassRoom c) -> c.getTeacherId() != null, Comparator.reverseOrder())
				.thenComparing(c -> c.getStatus() == Status.ACTIVE, Comparator.reverseOrder())
				.thenComparing(c -> c.getId() != null ? c.getId() : 0L);
	}

	private List<ClassRoom> resolveClasses(ActorContext actor) {
		if (actor == null) {
			return List.of();
		}
		if (actor.getRole() == Role.TEACHER && actor.getTeacherId() != null) {
			List<ClassRoom> byTeacher = classRoomRepository.findByTeacherId(actor.getTeacherId());
			if (!byTeacher.isEmpty()) {
				return byTeacher.stream().sorted(classRoomComparator()).collect(Collectors.toList());
			}
			// Fall back to classes linked via TeacherStandardDivision. A ClassRoom does
			// not persist a division id (only a grade string + division letter), so the
			// teacher's assigned StandardDivision rows are compared as (standard,
			// division) pairs against each class's (grade, division) - never by id, and
			// never by inventing an id the model does not store.
			Set<String> assignedStandardDivisions = teacherStandardDivisionRepository
					.findByTeacherId(actor.getTeacherId()).stream()
					.map(tsd -> tsd.getStandardDivision())
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
					.sorted(classRoomComparator())
					.collect(Collectors.toList());
		}
		if (actor.getSchoolId() != null) {
			return classRoomRepository.findBySchoolId(actor.getSchoolId()).stream()
					.sorted(classRoomComparator())
					.collect(Collectors.toList());
		}
		// Super Admin without a school filter: list all classes (bounded for safety).
		return classRoomRepository.findAll().stream()
				.sorted(classRoomComparator())
				.limit(200)
				.collect(Collectors.toList());
	}

	// Matches a class by the classifier params; falls back to the first in scope.
	private ClassRoom pickClass(List<ClassRoom> classes, Map<String, Object> params) {
		String className = strParam(params, "className");
		String grade = strParam(params, "grade");
		if (grade.isEmpty()) {
			grade = strParam(params, "standard");
		}
		String division = strParam(params, "division");

		if (!className.isEmpty()) {
			String normClassName = className.replaceAll("[\\s_-]+", "").toLowerCase(Locale.ROOT);
			Optional<ClassRoom> byName = classes.stream()
					.filter(c -> c.getName() != null && c.getName().replaceAll("[\\s_-]+", "").equalsIgnoreCase(normClassName))
					.sorted(classRoomComparator())
					.findFirst();
			if (byName.isPresent()) {
				return byName.get();
			}
		}

		if (!grade.isEmpty()) {
			String targetNormGrade = normalizeStandard(grade);
			String targetNormDiv = division.trim().toLowerCase(Locale.ROOT);

			if (!targetNormDiv.isEmpty()) {
				Optional<ClassRoom> byBoth = classes.stream()
						.filter(c -> normalizeStandard(c.getGrade()).equalsIgnoreCase(targetNormGrade)
								&& c.getDivision() != null
								&& c.getDivision().trim().equalsIgnoreCase(targetNormDiv))
						.sorted(classRoomComparator())
						.findFirst();
				if (byBoth.isPresent()) {
					return byBoth.get();
				}
			}

			Optional<ClassRoom> byGrade = classes.stream()
					.filter(c -> normalizeStandard(c.getGrade()).equalsIgnoreCase(targetNormGrade))
					.sorted(classRoomComparator())
					.findFirst();
			if (byGrade.isPresent()) {
				return byGrade.get();
			}
		}

		if (!division.isEmpty()) {
			String targetNormDiv = division.trim().toLowerCase(Locale.ROOT);
			Optional<ClassRoom> byDiv = classes.stream()
					.filter(c -> c.getDivision() != null && c.getDivision().trim().equalsIgnoreCase(targetNormDiv))
					.sorted(classRoomComparator())
					.findFirst();
			if (byDiv.isPresent()) {
				return byDiv.get();
			}
		}

		return classes.stream().sorted(classRoomComparator()).findFirst().orElse(classes.get(0));
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
