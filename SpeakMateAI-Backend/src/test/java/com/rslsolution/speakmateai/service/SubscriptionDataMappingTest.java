package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.rslsolution.speakmateai.dto.request.CreateOrderRequest;
import com.rslsolution.speakmateai.dto.request.VerifyPaymentRequest;
import com.rslsolution.speakmateai.dto.response.CreateOrderResponse;
import com.rslsolution.speakmateai.dto.response.SubscriptionStatusResponse;
import com.rslsolution.speakmateai.dto.response.UserSubscriptionResponse;
import com.rslsolution.speakmateai.entity.SubscriptionPlan;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.UserSubscription;
import com.rslsolution.speakmateai.enums.PaymentStatus;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;
import com.rslsolution.speakmateai.repository.PaymentRepository;
import com.rslsolution.speakmateai.repository.SubscriptionPlanRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;
import com.rslsolution.speakmateai.service.impl.AdminSubscriptionServiceImpl;
import com.rslsolution.speakmateai.service.impl.UserSubscriptionServiceImpl;

public class SubscriptionDataMappingTest {

    private UserRepository userRepository;
    private UserSubscriptionRepository userSubscriptionRepository;
    private SubscriptionPlanRepository subscriptionPlanRepository;
    private PaymentRepository paymentRepository;

    private UserSubscriptionServiceImpl userSubscriptionService;
    private AdminSubscriptionServiceImpl adminSubscriptionService;

    private User testUser;
    private SubscriptionPlan monthlyPlan;
    private SubscriptionPlan yearlyPlan;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        userSubscriptionRepository = mock(UserSubscriptionRepository.class);
        subscriptionPlanRepository = mock(SubscriptionPlanRepository.class);
        paymentRepository = mock(PaymentRepository.class);

        userSubscriptionService = new UserSubscriptionServiceImpl(
                userRepository, userSubscriptionRepository, subscriptionPlanRepository
        );

        adminSubscriptionService = new AdminSubscriptionServiceImpl(
                subscriptionPlanRepository, userSubscriptionRepository, userRepository, paymentRepository
        );

        testUser = new User();
        testUser.setId(101L);
        testUser.setEmail("learner@speakmate.ai");
        testUser.setFirstName("Alice");
        testUser.setLastName("Learner");

        monthlyPlan = SubscriptionPlan.builder()
                .id(3L)
                .planName("MONTHLY_PRO")
                .price(149.00)
                .currency("INR")
                .durationMonths(1)
                .isActive(true)
                .build();

        yearlyPlan = SubscriptionPlan.builder()
                .id(4L)
                .planName("YEARLY_PRO")
                .price(1199.00)
                .currency("INR")
                .durationMonths(12)
                .isActive(true)
                .build();

        when(subscriptionPlanRepository.findByPlanNameIgnoreCase("MONTHLY_PRO"))
                .thenReturn(Optional.of(monthlyPlan));
        when(subscriptionPlanRepository.findByPlanNameIgnoreCase("YEARLY_PRO"))
                .thenReturn(Optional.of(yearlyPlan));

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("learner@speakmate.ai");
        when(auth.isAuthenticated()).thenReturn(true);
        SecurityContext sec = mock(SecurityContext.class);
        when(sec.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sec);

        when(userRepository.findByEmail("learner@speakmate.ai")).thenReturn(Optional.of(testUser));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testPlanResolution_MonthlyPro_CreatesOrderAndAttachesPlan() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setPlanType("MONTHLY_PRO");

        CreateOrderResponse response = userSubscriptionService.createOrder(request);

        assertNotNull(response);
        assertEquals("MONTHLY_PRO", response.getPlanType());
        assertEquals(new BigDecimal("149.00"), response.getAmount());
        assertEquals(14900L, response.getAmountInPaise());
        assertEquals("INR", response.getCurrency());

        ArgumentCaptor<UserSubscription> captor = ArgumentCaptor.forClass(UserSubscription.class);
        verify(userSubscriptionRepository).save(captor.capture());

        UserSubscription saved = captor.getValue();
        assertEquals("MONTHLY_PRO", saved.getPlanType());
        assertEquals("PENDING", saved.getStatus());
        assertNotNull(saved.getSubscriptionPlan(), "subscriptionPlan must be linked to MONTHLY_PRO plan");
        assertEquals(3L, saved.getSubscriptionPlan().getId());
        assertEquals("MONTHLY_PRO", saved.getSubscriptionPlan().getPlanName());
    }

    @Test
    void testPlanResolution_YearlyPro_CreatesOrderAndAttachesPlan() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setPlanType("YEARLY_PRO");

        CreateOrderResponse response = userSubscriptionService.createOrder(request);

        assertNotNull(response);
        assertEquals("YEARLY_PRO", response.getPlanType());
        assertEquals(new BigDecimal("1199.00"), response.getAmount());
        assertEquals(119900L, response.getAmountInPaise());

        ArgumentCaptor<UserSubscription> captor = ArgumentCaptor.forClass(UserSubscription.class);
        verify(userSubscriptionRepository).save(captor.capture());

        UserSubscription saved = captor.getValue();
        assertEquals("YEARLY_PRO", saved.getPlanType());
        assertEquals("PENDING", saved.getStatus());
        assertNotNull(saved.getSubscriptionPlan(), "subscriptionPlan must be linked to YEARLY_PRO plan");
        assertEquals(4L, saved.getSubscriptionPlan().getId());
        assertEquals("YEARLY_PRO", saved.getSubscriptionPlan().getPlanName());
    }

    @Test
    void testVerifyPayment_AttachesPlanAndActivatesPro() {
        String orderId = "order_dev_123456789";
        UserSubscription pendingSub = UserSubscription.builder()
                .user(testUser)
                .planType("MONTHLY_PRO")
                .status("PENDING")
                .amount(new BigDecimal("149.00"))
                .currency("INR")
                .razorpayOrderId(orderId)
                .subscriptionPlan(null) // simulates unlinked pending record
                .build();

        when(userSubscriptionRepository.findByRazorpayOrderId(orderId)).thenReturn(Optional.of(pendingSub));

        VerifyPaymentRequest request = new VerifyPaymentRequest();
        request.setRazorpayOrderId(orderId);
        request.setRazorpayPaymentId("pay_dev_987654321");
        request.setRazorpaySignature("sig_dev_dummy");
        request.setPlanType("MONTHLY_PRO");

        SubscriptionStatusResponse response = userSubscriptionService.verifyPayment(request);

        assertTrue(response.getPro());
        assertEquals("ACTIVE", response.getStatus());
        assertEquals("MONTHLY_PRO", response.getPlanType());
        assertEquals(9999, response.getDailyMinutesLimit());
        assertEquals(9999, response.getDailyGrammarLimit());

        assertNotNull(pendingSub.getSubscriptionPlan(), "verifyPayment should attach resolved SubscriptionPlan");
        assertEquals(3L, pendingSub.getSubscriptionPlan().getId());
        assertEquals("ACTIVE", pendingSub.getStatus());
    }

    @Test
    void testAdminSubscriberMapping_SafeWithNullSubscriptionPlan() {
        // Legacy record with subscriptionPlan == null
        UserSubscription legacySub = new UserSubscription();
        legacySub.setId(50L);
        legacySub.setUser(testUser);
        legacySub.setSubscriptionPlan(null); // legacy null
        legacySub.setPlanType("MONTHLY_PRO");
        legacySub.setStatus("PENDING");
        legacySub.setAmount(new BigDecimal("149.00"));
        legacySub.setStartDate(LocalDateTime.now().minusDays(2));
        legacySub.setEndDate(LocalDateTime.now().plusDays(28));

        List<UserSubscription> subs = List.of(legacySub);
        when(userSubscriptionRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(new PageImpl<>(subs));

        Page<UserSubscriptionResponse> page = adminSubscriptionService.getUserSubscriptions(0, 10, "id", "DESC");

        assertNotNull(page);
        assertEquals(1, page.getContent().size());
        UserSubscriptionResponse res = page.getContent().get(0);
        assertEquals(50L, res.getId());
        assertEquals("MONTHLY_PRO", res.getPlanName(), "Should resolve plan name from planType when subscriptionPlan is null");
        assertEquals(3L, res.getPlanId(), "Should resolve plan ID from repository when subscriptionPlan is null");
        assertEquals("Alice", res.getUserFirstName());
        assertEquals("learner@speakmate.ai", res.getUserEmail());
    }

    @Test
    void testAdminSubscriberMapping_SafeWithCompletelyUnknownPlanAndNulls() {
        UserSubscription brokenSub = new UserSubscription();
        brokenSub.setId(99L);
        brokenSub.setUser(null); // null user
        brokenSub.setSubscriptionPlan(null); // null plan
        brokenSub.setPlanType(null); // null planType
        brokenSub.setStatus(null); // null status

        List<UserSubscription> subs = List.of(brokenSub);
        when(userSubscriptionRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(new PageImpl<>(subs));

        Page<UserSubscriptionResponse> page = adminSubscriptionService.getUserSubscriptions(0, 10, "id", "DESC");

        assertNotNull(page);
        UserSubscriptionResponse res = page.getContent().get(0);
        assertEquals(99L, res.getId());
        assertEquals("Unknown Plan", res.getPlanName());
        assertNull(res.getPlanId());
        assertEquals("", res.getUserFirstName());
        assertNull(res.getUserId());
    }

    @Test
    void testAdminCsvExport_SafeWithNullSubscriptionPlan() {
        List<UserSubscription> mockList = new ArrayList<>();

        // 1. Fully linked modern sub
        UserSubscription modernSub = new UserSubscription();
        modernSub.setId(1L);
        modernSub.setUser(testUser);
        modernSub.setSubscriptionPlan(yearlyPlan);
        modernSub.setPlanType("YEARLY_PRO");
        modernSub.setStatus("ACTIVE");
        modernSub.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        modernSub.setPaymentStatus(PaymentStatus.PAID);
        modernSub.setAmountPaid(1199.0);
        modernSub.setStartDate(LocalDateTime.now());
        modernSub.setExpiryDate(LocalDateTime.now().plusYears(1));
        mockList.add(modernSub);

        // 2. Legacy sub with NULL subscriptionPlan
        UserSubscription legacySub = new UserSubscription();
        legacySub.setId(2L);
        legacySub.setUser(testUser);
        legacySub.setSubscriptionPlan(null);
        legacySub.setPlanType("MONTHLY_PRO");
        legacySub.setStatus("PENDING");
        legacySub.setAmount(new BigDecimal("149.00"));
        legacySub.setStartDate(LocalDateTime.now());
        legacySub.setEndDate(LocalDateTime.now().plusMonths(1));
        mockList.add(legacySub);

        when(userSubscriptionRepository.findAll()).thenReturn(mockList);

        String csv = adminSubscriptionService.exportSubscriptionsCsv();

        assertNotNull(csv);
        assertTrue(csv.contains("ID,User Name,Email,Plan Name,Payment Status,Subscription Status,Start Date,Expiry Date,Amount Paid"));
        assertTrue(csv.contains("YEARLY_PRO"));
        assertTrue(csv.contains("MONTHLY_PRO"));
        assertTrue(csv.contains("Alice Learner"));
    }

    @Test
    void testInstitutionalStudentBypass_Preserved() {
        // User with schoolId set
        testUser.setSchoolId(500L);
        testUser.setCreatedAt(LocalDateTime.now().minusMonths(1));

        SubscriptionStatusResponse response = userSubscriptionService.getMySubscription();

        assertTrue(response.getPro());
        assertEquals("SCHOOL_INSTITUTIONAL", response.getPlanType());
        assertEquals("ACTIVE", response.getStatus());
        assertEquals(9999, response.getDailyMinutesLimit());
        assertEquals(9999, response.getDailyGrammarLimit());
        assertTrue(response.getMessage().contains("Institutional Student License"));
    }

    @Test
    void testAssignPlanToUser_NonLearnerRole_ThrowsException() {
        User superAdmin = new User();
        superAdmin.setId(999L);
        superAdmin.setEmail("superadmin@speakmate.ai");
        superAdmin.setRole(com.rslsolution.speakmateai.enums.Role.SUPER_ADMIN);

        when(userRepository.findById(999L)).thenReturn(Optional.of(superAdmin));

        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () -> {
            adminSubscriptionService.assignPlanToUser(999L, 2L, com.rslsolution.speakmateai.enums.PaymentMethod.CARD, 149.0, "TXN123");
        });
    }
}
