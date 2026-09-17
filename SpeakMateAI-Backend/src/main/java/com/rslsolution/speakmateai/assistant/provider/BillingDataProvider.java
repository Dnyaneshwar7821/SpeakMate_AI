package com.rslsolution.speakmateai.assistant.provider;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
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
