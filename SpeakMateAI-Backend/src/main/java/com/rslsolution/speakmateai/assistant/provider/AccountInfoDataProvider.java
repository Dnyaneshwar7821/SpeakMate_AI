package com.rslsolution.speakmateai.assistant.provider;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.UserSubscription;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;
import com.rslsolution.speakmateai.assistant.TeacherAssignmentResolver;
import org.springframework.transaction.annotation.Transactional;

/**
 * Answers questions about the authenticated caller's OWN account/identity
 * ("what is my logged-in email?", "who am I?", "my role", "my school",
 * "my phone", "my joined date", "my subscription/plan").
 *
 * <p>The data comes from the already-resolved {@link ActorContext} plus the
 * caller's own school (when scoped). No sensitive profile data and no other
 * user's data is ever queried or exposed — a caller can only ever see their
 * own account, and no DB write is performed.
 */
@Component
@Transactional(readOnly = true)
public class AccountInfoDataProvider implements AssistantDataProvider {

	private final SchoolRepository schoolRepository;
	private final UserSubscriptionRepository userSubscriptionRepository;
	private final TeacherAssignmentResolver teacherAssignmentResolver;
	private final ObjectMapper objectMapper;

	public AccountInfoDataProvider(SchoolRepository schoolRepository,
			UserSubscriptionRepository userSubscriptionRepository,
			TeacherAssignmentResolver teacherAssignmentResolver,
			ObjectMapper objectMapper) {
		this.schoolRepository = schoolRepository;
		this.userSubscriptionRepository = userSubscriptionRepository;
		this.teacherAssignmentResolver = teacherAssignmentResolver;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.ACCOUNT_INFO;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Map<String, Object> data = new LinkedHashMap<>();
		if (params != null) {
			data.putAll(params);
		}
		if (actor == null) {
			data.put("message", "NO DATA");
			data.put("reason", "Authenticated caller context is missing.");
			return toJson(data);
		}
		data.put("scope", "SELF (own account only)");
		data.put("email", actor.getEmail());
		data.put("displayName", actor.getDisplayName());
		data.put("role", actor.getRole() != null ? actor.getRole().name() : null);
		if (actor.getUserId() != null) {
			data.put("userId", actor.getUserId());
			try {
				Optional<UserSubscription> sub = userSubscriptionRepository
						.findFirstByUserIdAndSubscriptionStatus(actor.getUserId(), SubscriptionStatus.ACTIVE);
				if (sub.isPresent()) {
					String plan = sub.get().getPlanType() != null ? sub.get().getPlanType() : "PRO Plan";
					data.put("currentSubscription", plan);
					data.put("subscriptionPlan", plan);
					data.put("subscriptionStatus", "ACTIVE");
				} else if (actor.getSchoolId() != null) {
					data.put("currentSubscription", "Institutional School Plan");
					data.put("subscriptionPlan", "Institutional School Plan");
					data.put("subscriptionStatus", "ACTIVE");
				} else {
					data.put("currentSubscription", "Free Tier");
					data.put("subscriptionPlan", "Free Tier");
					data.put("subscriptionStatus", "FREE");
				}
			} catch (Exception e) {
				if (actor.getSchoolId() != null) {
					data.put("currentSubscription", "Institutional School Plan");
					data.put("subscriptionPlan", "Institutional School Plan");
					data.put("subscriptionStatus", "ACTIVE");
				} else {
					data.put("currentSubscription", "Free Tier");
					data.put("subscriptionPlan", "Free Tier");
				}
			}
		}
		if (actor.getSchoolId() != null) {
			data.put("schoolId", actor.getSchoolId());
		}
		if (actor.getTeacherId() != null) {
			data.put("teacherId", actor.getTeacherId());
		}
		if (actor.getStudentId() != null) {
			data.put("studentId", actor.getStudentId());
		}
		if (actor.getAdminId() != null) {
			data.put("adminId", actor.getAdminId());
		}
		// "my phone" / "my joined date": the caller's OWN contact number and join
		// date, carried on the resolved ActorContext (users row for school
		// admins/teachers/students, admins row for the Super Admin). Own-account
		// data only — never another user's.
		if (actor.getPhone() != null && !actor.getPhone().isBlank()) {
			data.put("phone", actor.getPhone());
		}
		if (actor.getJoinedAt() != null && !actor.getJoinedAt().isBlank()) {
			data.put("joinedAt", actor.getJoinedAt());
		}

		String schoolName = null;
		String schoolAddress = null;
		Long schoolId = actor.getSchoolId();
		if (schoolId != null) {
			Optional<School> school = schoolRepository.findById(java.util.Objects.requireNonNull(schoolId));
			if (school.isPresent()) {
				School s = school.get();
				schoolName = displayName(s);
				data.put("schoolName", schoolName);
				schoolAddress = s.getAddress();
				if (schoolAddress != null && !schoolAddress.isBlank()) {
					data.put("schoolAddress", schoolAddress);
				}
			}
		}
		// "my location": the caller's own location for a Super Admin comes from the
		// admins row; a school-scoped caller has no location of their own, so fall
		// back to their school's address. Either way this is the caller's OWN
		// location — no other user's or other school's data is ever exposed.
		String location = actor.getLocation();
		if (location == null || location.isBlank()) {
			location = schoolAddress;
		}
		if (location != null && !location.isBlank()) {
			data.put("location", location);
		}
		if (actor.getStandard() != null && !actor.getStandard().isBlank()) {
			data.put("standard", actor.getStandard());
		}
		if (actor.getDivision() != null && !actor.getDivision().isBlank()) {
			data.put("division", actor.getDivision());
		}
		if (actor.getRollNumber() != null && !actor.getRollNumber().isBlank()) {
			data.put("rollNumber", actor.getRollNumber());
		}

		String assignedTeacherName = null;
		if (actor.getRole() == com.rslsolution.speakmateai.enums.Role.STUDENT || actor.getStudentId() != null) {
			try {
				Long targetStudentId = actor.getUserId() != null ? actor.getUserId() : actor.getStudentId();
				List<Map<String, Object>> teachers = teacherAssignmentResolver.resolveAssignedTeachersForStudent(
						targetStudentId, actor.getSchoolId(), actor.getStandard(), actor.getDivision());
				if (teachers != null && !teachers.isEmpty()) {
					data.put("assignedTeachers", teachers);
					assignedTeacherName = String.valueOf(teachers.get(0).get("name"));
					data.put("assignedTeacher", assignedTeacherName);
					if (teachers.get(0).get("subject") != null) {
						data.put("teacherSubject", teachers.get(0).get("subject"));
					}
				}
			} catch (Exception ignored) {
			}
		}


		data.put("dailyGoalMinutes", actor.getDailyGoalMinutes() != null ? actor.getDailyGoalMinutes() : 15);
		int currentXp = actor.getXp() != null ? actor.getXp() : 0;
		data.put("xp", currentXp);
		data.put("totalXp", currentXp);
		int currentStreak = actor.getCurrentStreak() != null ? actor.getCurrentStreak() : 0;
		int longestStreak = actor.getLongestStreak() != null ? actor.getLongestStreak() : 0;
		data.put("currentStreak", currentStreak);
		data.put("longestStreak", longestStreak);

		String subPlan = data.get("subscriptionPlan") != null ? String.valueOf(data.get("subscriptionPlan")) : null;
		data.put("summary", accountSummary(actor, schoolName, location, subPlan, assignedTeacherName));
		return toJson(data);
	}

	private String accountSummary(ActorContext actor, String schoolName, String location, String subscriptionPlan, String assignedTeacherName) {
		String role = actor.getRole() != null ? actor.getRole().name().replace('_', ' ') : "user";
		StringBuilder sb = new StringBuilder();
		if (actor.getDisplayName() != null && !actor.getDisplayName().isBlank()) {
			sb.append("You are logged in as ").append(actor.getDisplayName()).append(" (a ").append(role).append(")");
		} else {
			sb.append("You are logged in as a ").append(role);
		}
		if (actor.getEmail() != null) {
			sb.append(" with email ").append(actor.getEmail());
		}
		if (actor.getStandard() != null && !actor.getStandard().isBlank()) {
			sb.append(", Standard ").append(actor.getStandard());
			if (actor.getDivision() != null && !actor.getDivision().isBlank()) {
				sb.append("-").append(actor.getDivision());
			}
		}
		if (actor.getRollNumber() != null && !actor.getRollNumber().isBlank()) {
			sb.append(", Roll No. ").append(actor.getRollNumber());
		}
		if (assignedTeacherName != null && !assignedTeacherName.isBlank()) {
			sb.append(", taught by teacher ").append(assignedTeacherName);
		}
		if (schoolName != null) {
			sb.append(" at ").append(schoolName);
		}
		if (subscriptionPlan != null && !subscriptionPlan.isBlank()) {
			sb.append(" enrolled in the ").append(subscriptionPlan);
		}
		if (location != null && !location.isBlank()) {
			sb.append(" based in ").append(location);
		}
		return sb.append(".").toString();
	}

	private String displayName(School school) {
		return school.getSchoolName() != null ? school.getSchoolName() : school.getName();
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
