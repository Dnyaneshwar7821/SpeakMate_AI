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
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.PaymentRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SchoolStandardRepository;
import com.rslsolution.speakmateai.repository.StandardDivisionRepository;
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
	private final ObjectMapper objectMapper;

	public PlatformDataProvider(UserRepository userRepository, SchoolRepository schoolRepository,
			ProgressRepository progressRepository, PaymentRepository paymentRepository,
			UserSubscriptionRepository userSubscriptionRepository,
			SubscriptionPlanRepository subscriptionPlanRepository, ClassRoomRepository classRoomRepository,
			SchoolStandardRepository schoolStandardRepository, StandardDivisionRepository standardDivisionRepository,
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
