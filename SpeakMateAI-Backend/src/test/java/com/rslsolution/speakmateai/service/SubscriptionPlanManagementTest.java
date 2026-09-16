package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.rslsolution.speakmateai.dto.request.SubscriptionPlanCreateRequest;
import com.rslsolution.speakmateai.dto.request.SubscriptionPlanUpdateRequest;
import com.rslsolution.speakmateai.dto.response.SubscriptionPlanResponse;
import com.rslsolution.speakmateai.entity.SubscriptionPlan;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;
import com.rslsolution.speakmateai.repository.PaymentRepository;
import com.rslsolution.speakmateai.repository.SubscriptionPlanRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;
import com.rslsolution.speakmateai.service.impl.AdminSubscriptionServiceImpl;

public class SubscriptionPlanManagementTest {

    private UserRepository userRepository;
    private UserSubscriptionRepository userSubscriptionRepository;
    private SubscriptionPlanRepository subscriptionPlanRepository;
    private PaymentRepository paymentRepository;
    private AdminSubscriptionServiceImpl adminSubscriptionService;

    private SubscriptionPlan freePlan;
    private SubscriptionPlan monthlyPlan;
    private SubscriptionPlan yearlyPlan;
    private SubscriptionPlan customPlan;

    @BeforeEach
    public void setup() {
        userRepository = mock(UserRepository.class);
        userSubscriptionRepository = mock(UserSubscriptionRepository.class);
        subscriptionPlanRepository = mock(SubscriptionPlanRepository.class);
        paymentRepository = mock(PaymentRepository.class);

        adminSubscriptionService = new AdminSubscriptionServiceImpl(
                subscriptionPlanRepository,
                userSubscriptionRepository,
                userRepository,
                paymentRepository
        );

        freePlan = SubscriptionPlan.builder()
                .id(1L)
                .planName("FREE_STARTER")
                .description("Default Free Starter")
                .durationMonths(0)
                .price(0.0)
                .currency("INR")
                .billingCycle("LIFETIME")
                .features("5 Free AI Sessions, Daily Vocab")
                .maxLessons(5)
                .maxTests(2)
                .aiPracticeLimit(15)
                .grammarPracticeLimit(15)
                .speakingPracticeLimit(15)
                .vocabularyPracticeLimit(15)
                .isActive(true)
                .build();

        monthlyPlan = SubscriptionPlan.builder()
                .id(2L)
                .planName("MONTHLY_PRO")
                .description("SpeakMate Pro Monthly")
                .durationMonths(1)
                .price(149.0)
                .currency("INR")
                .billingCycle("MONTHLY")
                .features("Unlimited AI Speaking, Grammar Doctor")
                .maxLessons(9999)
                .maxTests(9999)
                .aiPracticeLimit(9999)
                .grammarPracticeLimit(9999)
                .speakingPracticeLimit(9999)
                .vocabularyPracticeLimit(9999)
                .isActive(true)
                .build();

        yearlyPlan = SubscriptionPlan.builder()
                .id(3L)
                .planName("YEARLY_PRO")
                .description("SpeakMate Pro Annual")
                .durationMonths(12)
                .price(1199.0)
                .currency("INR")
                .billingCycle("YEARLY")
                .features("Unlimited AI Speaking, CEFR Certificate")
                .maxLessons(9999)
                .maxTests(9999)
                .aiPracticeLimit(9999)
                .grammarPracticeLimit(9999)
                .speakingPracticeLimit(9999)
                .vocabularyPracticeLimit(9999)
                .isActive(true)
                .build();

        customPlan = SubscriptionPlan.builder()
                .id(4L)
                .planName("CUSTOM_INSTITUTIONAL")
                .description("Custom Plan for partner")
                .durationMonths(6)
                .price(2999.0)
                .currency("INR")
                .billingCycle("6 Months")
                .features("Partner features")
                .maxLessons(50)
                .maxTests(20)
                .aiPracticeLimit(200)
                .grammarPracticeLimit(200)
                .speakingPracticeLimit(200)
                .vocabularyPracticeLimit(200)
                .isActive(true)
                .build();
    }

    @Test
    public void testGetAllPlans_EnrichedWithSubscriberCountsAndBillingCycle() {
        when(userRepository.count()).thenReturn(32L);
        when(userSubscriptionRepository.countDistinctActiveProSubscribers(SubscriptionStatus.ACTIVE)).thenReturn(0L);
        when(userSubscriptionRepository.countDistinctSubscribersByPlan(2L, "MONTHLY_PRO")).thenReturn(3L);
        when(userSubscriptionRepository.countDistinctMonthlyProSubscribers(SubscriptionStatus.ACTIVE)).thenReturn(0L);
        when(userSubscriptionRepository.countDistinctSubscribersByPlan(3L, "YEARLY_PRO")).thenReturn(0L);
        when(userSubscriptionRepository.countDistinctAnnualProSubscribers(SubscriptionStatus.ACTIVE)).thenReturn(0L);

        when(subscriptionPlanRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(freePlan, monthlyPlan, yearlyPlan)));

        Page<SubscriptionPlanResponse> result = adminSubscriptionService.getAllPlans(0, 10, "id", "ASC");

        assertNotNull(result);
        assertEquals(3, result.getContent().size());

        // Verify Free Plan response
        SubscriptionPlanResponse freeResp = result.getContent().get(0);
        assertEquals("FREE_STARTER", freeResp.getPlanName());
        assertEquals(32L, freeResp.getSubscriberCount());
        assertEquals(32L, freeResp.getActiveSubscriberCount());
        assertEquals("LIFETIME", freeResp.getBillingCycle());

        // Verify Monthly Pro response
        SubscriptionPlanResponse monthlyResp = result.getContent().get(1);
        assertEquals("MONTHLY_PRO", monthlyResp.getPlanName());
        assertEquals(3L, monthlyResp.getSubscriberCount());
        assertEquals(0L, monthlyResp.getActiveSubscriberCount());
        assertEquals("MONTHLY", monthlyResp.getBillingCycle());
    }

    @Test
    public void testCreatePlan_SuccessForCustomPlan() {
        SubscriptionPlanCreateRequest req = SubscriptionPlanCreateRequest.builder()
                .planName("BUSINESS_ELITE")
                .description("Business Elite Tier")
                .durationMonths(12)
                .billingCycle("YEARLY")
                .price(1999.0)
                .currency("INR")
                .features("Corporate roleplays, AI executive coaching")
                .maxLessons(100)
                .maxTests(50)
                .aiPracticeLimit(500)
                .grammarPracticeLimit(500)
                .speakingPracticeLimit(500)
                .vocabularyPracticeLimit(500)
                .aiMinutesLimit(300)
                .isActive(true)
                .build();

        when(subscriptionPlanRepository.existsByPlanNameIgnoreCase("BUSINESS_ELITE")).thenReturn(false);
        when(subscriptionPlanRepository.save(any(SubscriptionPlan.class))).thenAnswer(invocation -> {
            SubscriptionPlan p = invocation.getArgument(0);
            p.setId(10L);
            return p;
        });

        SubscriptionPlanResponse resp = adminSubscriptionService.createPlan(req);
        assertNotNull(resp);
        assertEquals("BUSINESS_ELITE", resp.getPlanName());
        assertEquals(1999.0, resp.getPrice());
        assertEquals("YEARLY", resp.getBillingCycle());
        assertEquals(12, resp.getDurationMonths());
        assertEquals(300, resp.getAiMinutesLimit());
        assertTrue(resp.getIsActive());
    }

    @Test
    public void testCreatePlan_RejectsReservedCorePlanNames() {
        SubscriptionPlanCreateRequest req = SubscriptionPlanCreateRequest.builder()
                .planName("MONTHLY_PRO")
                .durationMonths(1)
                .billingCycle("MONTHLY")
                .price(149.0)
                .currency("INR")
                .features("Test")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            adminSubscriptionService.createPlan(req);
        });

        assertTrue(ex.getMessage().contains("reserved for core SpeakMate learner plans"));
    }

    @Test
    public void testCreatePlan_WhenLifetimeBillingCycle_Succeeds() {
        SubscriptionPlanCreateRequest req = SubscriptionPlanCreateRequest.builder()
                .planName("COMMUNITY_FREE")
                .description("Community free tier")
                .durationMonths(0)
                .billingCycle("LIFETIME")
                .price(0.0)
                .currency("INR")
                .features("Free community access")
                .isActive(true)
                .build();

        when(subscriptionPlanRepository.existsByPlanNameIgnoreCase("COMMUNITY_FREE")).thenReturn(false);
        when(subscriptionPlanRepository.save(any(SubscriptionPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        SubscriptionPlanResponse resp = adminSubscriptionService.createPlan(req);
        assertNotNull(resp);
        assertEquals("COMMUNITY_FREE", resp.getPlanName());
        assertEquals("LIFETIME", resp.getBillingCycle());
        assertEquals(0, resp.getDurationMonths());
    }

    @Test
    public void testCreatePlan_WhenUnsupportedBillingCycle_ThrowsException() {
        SubscriptionPlanCreateRequest req = SubscriptionPlanCreateRequest.builder()
                .planName("UNSUPPORTED_PLAN")
                .durationMonths(5)
                .billingCycle("CUSTOM")
                .price(499.0)
                .currency("INR")
                .features("Test")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            adminSubscriptionService.createPlan(req);
        });

        assertTrue(ex.getMessage().contains("Unsupported billing cycle"));
    }

    @Test
    public void testCreatePlan_WhenDurationMismatchesBillingCycle_ThrowsException() {
        SubscriptionPlanCreateRequest req = SubscriptionPlanCreateRequest.builder()
                .planName("MISMATCH_PLAN")
                .durationMonths(12)
                .billingCycle("MONTHLY") // Monthly must have duration 1
                .price(199.0)
                .currency("INR")
                .features("Test")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            adminSubscriptionService.createPlan(req);
        });

        assertTrue(ex.getMessage().contains("Duration for MONTHLY billing cycle must be 1 month"));
    }

    @Test
    public void testCreatePlan_WhenNegativeUsageLimits_ThrowsException() {
        SubscriptionPlanCreateRequest req = SubscriptionPlanCreateRequest.builder()
                .planName("NEGATIVE_LIMIT_PLAN")
                .durationMonths(1)
                .billingCycle("MONTHLY")
                .price(199.0)
                .currency("INR")
                .features("Test")
                .aiPracticeLimit(-5)
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            adminSubscriptionService.createPlan(req);
        });

        assertTrue(ex.getMessage().contains("cannot be negative"));
    }

    @Test
    public void testCreatePlan_WhenNegativePrice_ThrowsException() {
        SubscriptionPlanCreateRequest req = SubscriptionPlanCreateRequest.builder()
                .planName("NEGATIVE_PRICE_PLAN")
                .durationMonths(1)
                .billingCycle("MONTHLY")
                .price(-50.0)
                .currency("INR")
                .features("Test")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            adminSubscriptionService.createPlan(req);
        });

        assertTrue(ex.getMessage().contains("Valid price is required"));
    }

    @Test
    public void testUpdatePlan_ProtectsCoreLearnerPlanPricingAndIdentifier() {
        when(subscriptionPlanRepository.findById(2L)).thenReturn(Optional.of(monthlyPlan));

        // Attempting to change price from 149 to 200 on core plan MONTHLY_PRO
        SubscriptionPlanUpdateRequest req = SubscriptionPlanUpdateRequest.builder()
                .planName("MONTHLY_PRO")
                .price(200.0)
                .currency("INR")
                .durationMonths(1)
                .features("New features")
                .description("New desc")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            adminSubscriptionService.updatePlan(2L, req);
        });

        assertTrue(ex.getMessage().contains("Pricing for core learner plan"));

        // Attempting to rename core plan MONTHLY_PRO to SOMETHING_ELSE
        SubscriptionPlanUpdateRequest reqRename = SubscriptionPlanUpdateRequest.builder()
                .planName("RENAMED_PRO")
                .price(149.0)
                .currency("INR")
                .durationMonths(1)
                .features("New features")
                .description("New desc")
                .build();

        IllegalArgumentException exRename = assertThrows(IllegalArgumentException.class, () -> {
            adminSubscriptionService.updatePlan(2L, reqRename);
        });

        assertTrue(exRename.getMessage().contains("Plan identifier for core learner plan"));
    }

    @Test
    public void testUpdatePlan_ProtectsCoreLearnerPlanUsageLimits() {
        when(subscriptionPlanRepository.findById(2L)).thenReturn(Optional.of(monthlyPlan));

        // Attempting to change aiPracticeLimit from 9999 to 50 on core plan MONTHLY_PRO
        SubscriptionPlanUpdateRequest reqLimits = SubscriptionPlanUpdateRequest.builder()
                .planName("MONTHLY_PRO")
                .price(149.0)
                .currency("INR")
                .durationMonths(1)
                .billingCycle("MONTHLY")
                .features("Unlimited AI Speaking, Grammar Doctor")
                .aiPracticeLimit(50)
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            adminSubscriptionService.updatePlan(2L, reqLimits);
        });

        assertTrue(ex.getMessage().contains("Learner usage limits for core learner plan"));
    }

    @Test
    public void testUpdatePlan_ProtectsCoreLearnerPlanBillingCycle() {
        when(subscriptionPlanRepository.findById(2L)).thenReturn(Optional.of(monthlyPlan));

        // Attempting to change billingCycle from MONTHLY to YEARLY on core plan MONTHLY_PRO
        SubscriptionPlanUpdateRequest reqCycle = SubscriptionPlanUpdateRequest.builder()
                .planName("MONTHLY_PRO")
                .price(149.0)
                .currency("INR")
                .durationMonths(1)
                .billingCycle("YEARLY")
                .features("Unlimited AI Speaking, Grammar Doctor")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            adminSubscriptionService.updatePlan(2L, reqCycle);
        });

        assertTrue(ex.getMessage().contains("Billing cycle for core learner plan"));
    }

    @Test
    public void testUpdatePlan_AllowsUpdatingCustomPlan() {
        when(subscriptionPlanRepository.findById(4L)).thenReturn(Optional.of(customPlan));
        when(subscriptionPlanRepository.save(any(SubscriptionPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        SubscriptionPlanUpdateRequest req = SubscriptionPlanUpdateRequest.builder()
                .planName("CUSTOM_INSTITUTIONAL_V2")
                .price(3499.0)
                .currency("INR")
                .durationMonths(12)
                .billingCycle("YEARLY")
                .description("Updated custom description")
                .features("Updated custom features")
                .maxLessons(60)
                .maxTests(30)
                .aiPracticeLimit(300)
                .grammarPracticeLimit(300)
                .speakingPracticeLimit(300)
                .vocabularyPracticeLimit(300)
                .aiMinutesLimit(250)
                .isActive(true)
                .build();

        SubscriptionPlanResponse resp = adminSubscriptionService.updatePlan(4L, req);

        assertNotNull(resp);
        assertEquals("CUSTOM_INSTITUTIONAL_V2", resp.getPlanName());
        assertEquals(3499.0, resp.getPrice());
        assertEquals("YEARLY", resp.getBillingCycle());
        assertEquals(12, resp.getDurationMonths());
        assertEquals(250, resp.getAiMinutesLimit());
        assertEquals("Updated custom description", resp.getDescription());
    }

    @Test
    public void testDeletePlan_BlocksDeletingCoreLearnerPlans() {
        when(subscriptionPlanRepository.findById(2L)).thenReturn(Optional.of(monthlyPlan));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            adminSubscriptionService.deletePlan(2L);
        });

        assertTrue(ex.getMessage().contains("cannot be deleted"));
    }

    @Test
    public void testActivateAndDeactivatePlan() {
        when(subscriptionPlanRepository.findById(4L)).thenReturn(Optional.of(customPlan));
        when(subscriptionPlanRepository.save(any(SubscriptionPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        SubscriptionPlanResponse deactResp = adminSubscriptionService.deactivatePlan(4L);
        assertFalse(deactResp.getIsActive());

        SubscriptionPlanResponse actResp = adminSubscriptionService.activatePlan(4L);
        assertTrue(actResp.getIsActive());
    }
}
