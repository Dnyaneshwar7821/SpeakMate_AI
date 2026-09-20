package com.rslsolution.speakmateai.assistant.provider;

import java.util.Comparator;
import java.util.HashMap;
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
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.PaymentRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SchoolStandardRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.StandardDivisionRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.SubscriptionPlanRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;

/**
 * Platform-wide overview (Super Admin only, enforced by the registry).
 * All aggregates use cheap COUNT queries - never full-entity selects that
 * Hibernate would polymorphically expand to 4-way LEFT JOINs just for .size().
 */
@Component
public class PlatformDataProvider implements AssistantDataProvider {

	private final UserRepository userRepository;
	private final SchoolRepository schoolRepository;
	private final ProgressRepository progressRepository;
	private final PaymentRepository paymentRepository;
	private final UserSubscriptionRepository userSubscriptionRepository;
	private final SubscriptionPlanRepository subscriptionPlanRepository;
	private final ClassRoomRepository classRoomRepository;
	private final SchoolStandardRepository schoolStandardRepository;
	private final StandardDivisionRepository standardDivisionRepository;
	private final SpeakingSessionRepository speakingSessionRepository;
	private final StudentRepository studentRepository;
	private final ObjectMapper objectMapper;

	public PlatformDataProvider(UserRepository userRepository, SchoolRepository schoolRepository,
			ProgressRepository progressRepository, PaymentRepository paymentRepository,
			UserSubscriptionRepository userSubscriptionRepository,
			SubscriptionPlanRepository subscriptionPlanRepository, ClassRoomRepository classRoomRepository,
			SchoolStandardRepository schoolStandardRepository, StandardDivisionRepository standardDivisionRepository,
			SpeakingSessionRepository speakingSessionRepository, StudentRepository studentRepository,
			ObjectMapper objectMapper) {
		this.userRepository = userRepository;
		this.schoolRepository = schoolRepository;
		this.progressRepository = progressRepository;
		this.paymentRepository = paymentRepository;
		this.userSubscriptionRepository = userSubscriptionRepository;
		this.subscriptionPlanRepository = subscriptionPlanRepository;
		this.classRoomRepository = classRoomRepository;
		this.schoolStandardRepository = schoolStandardRepository;
		this.standardDivisionRepository = standardDivisionRepository;
		this.speakingSessionRepository = speakingSessionRepository;
		this.studentRepository = studentRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.PLATFORM_OVERVIEW;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Map<String, Object> data = new LinkedHashMap<>();
		data.put("scope", "PLATFORM (all schools)");
		data.put("totalSchools", schoolRepository.count());
		data.put("totalUsers", userRepository.count());
		data.put("totalStudents", userRepository.countByRole(Role.STUDENT));
		data.put("totalTeachers", userRepository.countByRole(Role.TEACHER));
		data.put("totalSchoolAdmins", userRepository.countByRole(Role.SCHOOL_ADMIN));
		data.put("totalAdmins", userRepository.countByRole(Role.ADMIN) + userRepository.countByRole(Role.SUPER_ADMIN));
		data.put("activeUsers", userRepository.countByActiveTrue());
		data.put("activeStudents", userRepository.countByRoleAndActiveTrue(Role.STUDENT));
		data.put("activeTeachers", userRepository.countByRoleAndActiveTrue(Role.TEACHER));
		data.put("activeSchoolAdmins", userRepository.countByRoleAndActiveTrue(Role.SCHOOL_ADMIN));
		data.put("averagePracticeMinutesPerUser", progressRepository.getAveragePracticeMinutes());
		data.put("studentsWithActiveStreak", progressRepository.countByCurrentStreakGreaterThan(0));
		data.put("totalClasses", classRoomRepository.count());
		data.put("totalStandards", schoolStandardRepository.count());
		data.put("totalDivisions", standardDivisionRepository.count());
		data.put("totalRevenueFromPayments", paymentRepository.sumTotalRevenue());
		data.put("totalRevenueFromSubscriptions", userSubscriptionRepository.sumTotalRevenue());
		data.put("activeSubscriptionPlans", subscriptionPlanRepository.countByIsActiveTrue());
		data.put("totalSpeakingSessions", speakingSessionRepository != null ? speakingSessionRepository.count() : 0);

		if (studentRepository != null && progressRepository != null) {
			List<Student> students = studentRepository.findAll();
			List<Map<String, Object>> topStudents = students.stream()
					.map(s -> {
						Progress p = progressRepository.findByStudent(s).orElse(null);
						Map<String, Object> sm = new LinkedHashMap<>();
						String name = (s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "");
						sm.put("name", name.trim().isEmpty() ? s.getEmail() : name.trim());
						sm.put("schoolName", s.getSchoolName() != null ? s.getSchoolName() : "");
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

		data.put("schoolsByStudentCount", schoolStudentCounts());
		return toJson(data);
	}

	/**
	 * Per-school student + teacher counts for EVERY school, sorted descending by
	 * student count so the synthesizer can answer cross-school ranking questions
	 * ("which schools have the most students/teachers?"). Built from a single
	 * GROUP BY query per role - no N+1, no full entity loads.
	 */
	private List<Map<String, Object>> schoolStudentCounts() {
		Map<Long, Long> studentCounts = groupedCounts(userRepository.countStudentsGroupedBySchool());
		Map<Long, Long> teacherCounts = groupedCounts(userRepository.countTeachersGroupedBySchool());
		return schoolRepository.findAll().stream()
				.map(school -> {
					Map<String, Object> entry = new LinkedHashMap<>();
					String name = school.getSchoolName() != null ? school.getSchoolName() : school.getName();
					entry.put("schoolId", school.getId());
					entry.put("schoolName", name);
					entry.put("studentCount", studentCounts.getOrDefault(school.getId(), 0L));
					entry.put("teacherCount", teacherCounts.getOrDefault(school.getId(), 0L));
					return entry;
				})
				.sorted(Comparator.comparingLong(
						(Map<String, Object> e) -> ((Number) e.get("studentCount")).longValue())
						.reversed())
				.collect(Collectors.toList());
	}

	private Map<Long, Long> groupedCounts(List<Object[]> rows) {
		Map<Long, Long> counts = new HashMap<>();
		for (Object[] row : rows) {
			if (row[0] != null) {
				counts.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
			}
		}
		return counts;
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
