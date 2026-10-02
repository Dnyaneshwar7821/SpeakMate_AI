package com.rslsolution.speakmateai.assistant.provider;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.UserSubscription;
import com.rslsolution.speakmateai.enums.PaymentStatus;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;
import com.rslsolution.speakmateai.repository.PaymentRepository;
import com.rslsolution.speakmateai.repository.SubscriptionPlanRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;

/**
 * Billing / subscription / revenue data.
 *
 * Scoping (registry + provider enforced):
 * - Super Admin  -> platform-wide billing (all schools).
 * - School Admin -> own school only (filtered by the caller's schoolId).
 * - Everyone else -> not routed here (registry denies BILLING).
 */
@Component
public class BillingDataProvider implements AssistantDataProvider {

	private final PaymentRepository paymentRepository;
	private final UserSubscriptionRepository userSubscriptionRepository;
	private final SubscriptionPlanRepository subscriptionPlanRepository;
	private final ObjectMapper objectMapper;

	public BillingDataProvider(PaymentRepository paymentRepository,
			UserSubscriptionRepository userSubscriptionRepository,
			SubscriptionPlanRepository subscriptionPlanRepository, ObjectMapper objectMapper) {
		this.paymentRepository = paymentRepository;
		this.userSubscriptionRepository = userSubscriptionRepository;
		this.subscriptionPlanRepository = subscriptionPlanRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.BILLING;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);

		boolean platformWide = actor.getRole() == Role.SUPER_ADMIN;
		Long schoolId = actor.getSchoolId();

		Map<String, Object> data = new LinkedHashMap<>();
		data.put("scope", platformWide ? "PLATFORM (billing)" : "SCHOOL (billing, own school only)");
		data.put("totalRevenueFromPayments",
				platformWide ? paymentRepository.sumTotalRevenue() : paymentRepository.sumTotalRevenueForSchool(schoolId));
		data.put("revenueFromPaymentsLast30Days",
				platformWide ? paymentRepository.sumRevenueSince(monthAgo)
						: paymentRepository.sumRevenueSinceForSchool(monthAgo, schoolId));
		data.put("paidPaymentsCount",
				platformWide ? paymentRepository.countByPaymentStatus(PaymentStatus.PAID)
						: paymentRepository.countByPaymentStatusAndUserSchoolId(PaymentStatus.PAID, schoolId));
		data.put("totalRevenueFromSubscriptions",
				platformWide ? userSubscriptionRepository.sumTotalRevenue()
						: userSubscriptionRepository.sumTotalRevenueForSchool(schoolId));
		data.put("subscriptionRevenueLast30Days",
				platformWide ? userSubscriptionRepository.sumRevenueSince(monthAgo)
						: userSubscriptionRepository.sumRevenueSinceForSchool(monthAgo, schoolId));
		data.put("activeSubscriptions",
				platformWide ? userSubscriptionRepository.countBySubscriptionStatus(SubscriptionStatus.ACTIVE)
						: userSubscriptionRepository.countBySubscriptionStatusAndUserSchoolId(SubscriptionStatus.ACTIVE, schoolId));
		data.put("expiredSubscriptions",
				platformWide ? userSubscriptionRepository.countBySubscriptionStatus(SubscriptionStatus.EXPIRED)
						: userSubscriptionRepository.countBySubscriptionStatusAndUserSchoolId(SubscriptionStatus.EXPIRED, schoolId));
		data.put("cancelledSubscriptions",
				platformWide ? userSubscriptionRepository.countBySubscriptionStatus(SubscriptionStatus.CANCELLED)
						: userSubscriptionRepository.countBySubscriptionStatusAndUserSchoolId(SubscriptionStatus.CANCELLED, schoolId));

		List<UserSubscription> allSubs = platformWide ? userSubscriptionRepository.findAll() : (schoolId != null ? userSubscriptionRepository.findByUserSchoolId(schoolId) : List.of());
		List<Map<String, Object>> subscriberViews = allSubs.stream()
				.filter(s -> {
					if (platformWide) return true;
					return s.getUser() != null && schoolId != null && schoolId.equals(s.getUser().getSchoolId());
				})
				.filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()) || s.getSubscriptionStatus() == SubscriptionStatus.ACTIVE)
				.map(s -> {
					Map<String, Object> sub = new LinkedHashMap<>();
					User u = s.getUser();
					if (u != null) {
						String name = (u.getFirstName() != null ? u.getFirstName() : "") + " " + (u.getLastName() != null ? u.getLastName() : "");
						sub.put("userName", name.trim().isEmpty() ? u.getEmail() : name.trim());
						sub.put("userEmail", u.getEmail());
						if (u.getSchoolName() != null && !u.getSchoolName().isBlank()) {
							sub.put("schoolName", u.getSchoolName());
						}
					}
					String plan = s.getPlanType();
					if ((plan == null || plan.isBlank()) && s.getSubscriptionPlan() != null) {
						plan = s.getSubscriptionPlan().getPlanName();
					}
					sub.put("plan", plan != null ? plan : "PRO");
					if (s.getAmount() != null) {
						sub.put("amount", s.getAmount());
					} else if (s.getAmountPaid() != null) {
						sub.put("amount", s.getAmountPaid());
					}
					sub.put("status", s.getStatus() != null ? s.getStatus() : "ACTIVE");
					if (s.getStartDate() != null) {
						sub.put("startDate", s.getStartDate().toLocalDate().toString());
					}
					if (s.getEndDate() != null) {
						sub.put("endDate", s.getEndDate().toLocalDate().toString());
					}
					return sub;
				})
				.collect(Collectors.toList());

		data.put("subscribers", subscriberViews);
		data.put("subscriberCount", subscriberViews.size());

		// Subscription plan catalog is platform-level, not school-scoped.
		if (platformWide) {
			data.put("activePlans", subscriptionPlanRepository.countByIsActiveTrue());
			data.put("inactivePlans", subscriptionPlanRepository.countByIsActiveFalse());
		}
		return toJson(data);
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
