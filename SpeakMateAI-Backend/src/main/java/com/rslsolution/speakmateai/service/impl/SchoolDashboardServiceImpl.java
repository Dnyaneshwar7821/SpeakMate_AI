package com.rslsolution.speakmateai.service.impl;

import java.util.List;

import java.util.List;
import java.util.ArrayList;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.response.SchoolDashboardResponse;
import com.rslsolution.speakmateai.entity.Result;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.entity.SubscriptionPlan;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.LessonProgressRepository;
import com.rslsolution.speakmateai.repository.ResultRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SubscriptionPlanRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.SchoolDashboardService;

@Service
@Transactional
public class SchoolDashboardServiceImpl implements SchoolDashboardService {

	private final UserRepository userRepository;
	private final ClassRoomRepository classRoomRepository;
	private final ResultRepository resultRepository;
	private final LessonProgressRepository lessonProgressRepository;
	private final SchoolRepository schoolRepository;
	private final SubscriptionPlanRepository subscriptionPlanRepository;

	private static class CachedSchoolDashboard {
		final long timestamp;
		final SchoolDashboardResponse data;

		CachedSchoolDashboard(long timestamp, SchoolDashboardResponse data) {
			this.timestamp = timestamp;
			this.data = data;
		}
	}

	private final java.util.Map<Long, CachedSchoolDashboard> schoolDashboardCache = new java.util.concurrent.ConcurrentHashMap<>();

	public SchoolDashboardServiceImpl(UserRepository userRepository, ClassRoomRepository classRoomRepository,
			ResultRepository resultRepository, LessonProgressRepository lessonProgressRepository,
			SchoolRepository schoolRepository, SubscriptionPlanRepository subscriptionPlanRepository) {
		this.userRepository = userRepository;
		this.classRoomRepository = classRoomRepository;
		this.resultRepository = resultRepository;
		this.lessonProgressRepository = lessonProgressRepository;
		this.schoolRepository = schoolRepository;
		this.subscriptionPlanRepository = subscriptionPlanRepository;
	}

	private User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String email = authentication.getName();
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UserNotFoundException("User not found"));
	}

	@Override
	public SchoolDashboardResponse getSchoolDashboard() {
		User currentUser = getCurrentUser();

		if (currentUser.getRole() != Role.SCHOOL_ADMIN) {
			throw new RuntimeException("Unauthorized: Only School Admin can access this dashboard");
		}

		Long schoolId = currentUser.getSchoolId();
		if (schoolId == null) {
			throw new RuntimeException("School Admin is not associated with any school");
		}

		CachedSchoolDashboard cached = schoolDashboardCache.get(schoolId);
		if (cached != null && (System.currentTimeMillis() - cached.timestamp < 60_000)) {
			return cached.data;
		}

		List<User> students = userRepository.findBySchoolIdAndRole(schoolId, Role.STUDENT);
		long activeStudents = students.stream().filter(User::isActive).count();
		long inactiveStudents = students.size() - activeStudents;

		List<User> teachers = userRepository.findBySchoolIdAndRole(schoolId, Role.TEACHER);
		long totalTeachers = teachers.stream().filter(User::isActive).count();

		long totalClasses = classRoomRepository.findBySchoolId(schoolId).stream().filter(c -> c.getStatus() == Status.ACTIVE).count();

		List<Result> results = resultRepository.findAll((root, query, cb) -> {
			List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
			predicates.add(cb.equal(root.get("student").get("schoolId"), schoolId));
			predicates.add(cb.isTrue(root.get("active")));
			return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
		});

		long totalResults = results.size();
		double avgPercentage = 0.0;
		long excellent = 0;
		long good = 0;
		long passCount = 0;
		long fail = 0;

		if (!results.isEmpty()) {
			double totalPercentage = 0.0;
			for (Result r : results) {
				double percentage = r.getTotalMarks() != null && r.getTotalMarks() > 0
						? (r.getMarksObtained() / r.getTotalMarks()) * 100
						: 0.0;
				totalPercentage += percentage;

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
			avgPercentage = totalPercentage / results.size();
		}

		long totalLessonsCompleted = lessonProgressRepository.countByUserSchoolIdAndCompletedTrue(schoolId);

		School school = schoolRepository.findById(schoolId).orElse(null);
		String resolvedSchoolName = school != null
				? (school.getName() != null && !school.getName().isBlank() ? school.getName() : school.getSchoolName())
				: currentUser.getSchoolName();
		String resolvedSchoolCode = school != null ? school.getSchoolCode() : null;
		String resolvedSchoolAddress = school != null ? school.getAddress() : null;
		String adminFullName = ((currentUser.getFirstName() != null ? currentUser.getFirstName() : "") + " "
				+ (currentUser.getLastName() != null ? currentUser.getLastName() : "")).trim();

		SubscriptionPlan plan = (school != null && school.getSubscriptionPlanId() != null)
				? subscriptionPlanRepository.findById(school.getSubscriptionPlanId()).orElse(null)
				: null;
		String planName = plan != null ? plan.getPlanName() : null;
		Double planPrice = plan != null ? plan.getPrice() : null;
		String subStatus = school != null && school.getSubscriptionEndDate() != null
				? (java.time.LocalDateTime.now().isAfter(school.getSubscriptionEndDate()) ? "EXPIRED" : "ACTIVE")
				: (plan != null ? "ACTIVE" : "FREE");
		Integer maxStudents = school != null && school.getMaxStudents() != null
				? school.getMaxStudents()
				: (plan != null && plan.getStudentLimit() != null ? plan.getStudentLimit() : 500);

		SchoolDashboardResponse response = SchoolDashboardResponse.builder()
				.totalStudents((long) students.size())
				.activeStudents(activeStudents)
				.inactiveStudents(inactiveStudents)
				.totalTeachers(totalTeachers)
				.totalClasses(totalClasses)
				.totalResults(totalResults)
				.averageResultPercentage(Math.round(avgPercentage * 100.0) / 100.0)
				.excellentResults(excellent)
				.goodResults(good)
				.passResults(passCount)
				.failResults(fail)
				.totalLessonsCompleted(totalLessonsCompleted)
				.schoolId(schoolId)
				.schoolName(resolvedSchoolName)
				.schoolCode(resolvedSchoolCode)
				.schoolAddress(resolvedSchoolAddress)
				.adminName(adminFullName)
				.adminEmail(currentUser.getEmail())
				.subscriptionPlanId(school != null ? school.getSubscriptionPlanId() : null)
				.subscriptionPlanName(planName)
				.subscriptionPrice(planPrice)
				.subscriptionStartDate(school != null ? school.getSubscriptionStartDate() : null)
				.subscriptionEndDate(school != null ? school.getSubscriptionEndDate() : null)
				.subscriptionStatus(subStatus)
				.maxStudents(maxStudents)
				.build();

		schoolDashboardCache.put(schoolId, new CachedSchoolDashboard(System.currentTimeMillis(), response));
		return response;
	}
}
