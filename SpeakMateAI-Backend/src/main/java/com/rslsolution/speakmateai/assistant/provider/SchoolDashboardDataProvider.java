package com.rslsolution.speakmateai.assistant.provider;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.Result;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.LessonProgressRepository;
import com.rslsolution.speakmateai.repository.ResultRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

import jakarta.persistence.criteria.Predicate;

/**
 * Answers questions about the data shown on the School-Admin <b>Dashboard</b>
 * page: student/teacher counts, class count, results rollup and lesson
 * completions.
 *
 * <p>Read-only. The caller is always scoped to a single school: a School Admin
 * to their own school, a Super Admin to a school named in the question.
 */
@Component
public class SchoolDashboardDataProvider implements AssistantDataProvider {

	private final UserRepository userRepository;
	private final ClassRoomRepository classRoomRepository;
	private final ResultRepository resultRepository;
	private final LessonProgressRepository lessonProgressRepository;
	private final SchoolRepository schoolRepository;
	private final ObjectMapper objectMapper;

	public SchoolDashboardDataProvider(UserRepository userRepository, ClassRoomRepository classRoomRepository,
			ResultRepository resultRepository, LessonProgressRepository lessonProgressRepository,
			SchoolRepository schoolRepository, ObjectMapper objectMapper) {
		this.userRepository = userRepository;
		this.classRoomRepository = classRoomRepository;
		this.resultRepository = resultRepository;
		this.lessonProgressRepository = lessonProgressRepository;
		this.schoolRepository = schoolRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.SCHOOL_DASHBOARD;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Map<String, Object> data = new LinkedHashMap<>();
		if (actor == null) {
			data.put("message", "NO DATA");
			data.put("reason", "Authenticated caller context is missing.");
			return toJson(data);
		}
		Long schoolId = resolveSchoolId(actor, params);
		if (schoolId == null) {
			data.put("message", "NO DATA");
			data.put("reason", "No school scope is available for this caller.");
			return toJson(data);
		}

		List<User> students = userRepository.findBySchoolIdAndRole(schoolId, Role.STUDENT);
		long totalStudents = students.size();
		long activeStudents = students.stream().filter(User::isActive).count();
		long inactiveStudents = totalStudents - activeStudents;

		List<User> teachers = userRepository.findBySchoolIdAndRole(schoolId, Role.TEACHER);
		long totalTeachers = teachers.stream().filter(User::isActive).count();

		long totalClasses = classRoomRepository.findBySchoolId(schoolId).stream()
				.filter(c -> c.getStatus() == Status.ACTIVE).count();

		List<Result> results = schoolResults(schoolId);
		long excellent = 0;
		long good = 0;
		long passCount = 0;
		long fail = 0;
		double totalPercentage = 0.0;
		for (Result r : results) {
			totalPercentage += percentage(r);
			String status = r.getStatus() != null ? r.getStatus() : "FAIL";
			if ("Excellent".equalsIgnoreCase(status)) {
				excellent++;
			} else if ("Good".equalsIgnoreCase(status)) {
				good++;
			} else if ("Pass".equalsIgnoreCase(status)) {
				passCount++;
			} else if ("Fail".equalsIgnoreCase(status)) {
				fail++;
			}
		}
		double avgPercentage = results.isEmpty() ? 0.0 : totalPercentage / results.size();

		long totalLessonsCompleted = lessonProgressRepository.countByUserSchoolIdAndCompletedTrue(schoolId);

		School school = schoolRepository.findById(schoolId).orElse(null);
		String schoolName = school != null
				? (school.getName() != null && !school.getName().isBlank() ? school.getName() : school.getSchoolName())
				: null;

		data.put("scope", "SCHOOL (dashboard of the caller's school)");
		data.put("schoolId", schoolId);
		data.put("schoolName", schoolName);
		if (school != null) {
			data.put("schoolCode", school.getSchoolCode());
			data.put("schoolAddress", school.getAddress());
		}
		data.put("totalStudents", totalStudents);
		data.put("activeStudents", activeStudents);
		data.put("inactiveStudents", inactiveStudents);
		data.put("totalTeachers", totalTeachers);
		data.put("totalClasses", totalClasses);
		data.put("totalResults", (long) results.size());
		data.put("averageResultPercentage", round(avgPercentage));
		data.put("excellentResults", excellent);
		data.put("goodResults", good);
		data.put("passResults", passCount);
		data.put("failResults", fail);
		data.put("totalLessonsCompleted", totalLessonsCompleted);
		data.put("summary", "The dashboard for " + (schoolName != null ? schoolName : "this school") + " shows "
				+ totalStudents + " students (" + activeStudents + " active), " + totalTeachers + " teachers, "
				+ totalClasses + " classes and " + results.size() + " results recording an average of "
				+ round(avgPercentage) + "%.");
		return toJson(data);
	}

	private List<Result> schoolResults(Long schoolId) {
		return resultRepository.findAll((root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();
			predicates.add(cb.equal(root.get("student").get("schoolId"), schoolId));
			predicates.add(cb.isTrue(root.get("active")));
			return cb.and(predicates.toArray(new Predicate[0]));
		});
	}

	private double percentage(Result r) {
		if (r.getTotalMarks() != null && r.getTotalMarks() > 0 && r.getMarksObtained() != null) {
			return (r.getMarksObtained() / r.getTotalMarks()) * 100.0;
		}
		return 0.0;
	}

	private Long resolveSchoolId(ActorContext actor, Map<String, Object> params) {
		if (actor.getSchoolId() != null) {
			return actor.getSchoolId();
		}
		String name = strParam(params, "schoolName");
		if (name != null) {
			return schoolRepository.findByName(name).map(School::getId)
					.orElseGet(() -> schoolRepository.findAll().stream()
							.filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(name))
							.map(School::getId).findFirst().orElse(null));
		}
		return null;
	}

	private String strParam(Map<String, Object> params, String key) {
		if (params == null) {
			return null;
		}
		Object value = params.get(key);
		if (value == null) {
			return null;
		}
		String s = String.valueOf(value).trim();
		return s.isEmpty() ? null : s;
	}

	private double round(double value) {
		return Math.round(value * 100.0) / 100.0;
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
