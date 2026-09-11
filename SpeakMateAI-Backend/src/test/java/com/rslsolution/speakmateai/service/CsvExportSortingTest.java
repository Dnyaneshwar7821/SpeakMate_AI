package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.entity.Payment;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.SubscriptionPlan;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.UserSubscription;
import com.rslsolution.speakmateai.enums.PaymentStatus;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;
import com.rslsolution.speakmateai.mapper.AdminUserMapper;
import com.rslsolution.speakmateai.repository.*;
import com.rslsolution.speakmateai.service.impl.AdminBillingServiceImpl;
import com.rslsolution.speakmateai.service.impl.AdminSchoolUserServiceImpl;
import com.rslsolution.speakmateai.service.impl.AdminSubscriptionServiceImpl;
import com.rslsolution.speakmateai.service.impl.AdminUserServiceImpl;
import com.rslsolution.speakmateai.service.impl.StudentServiceImpl;

public class CsvExportSortingTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private List<Long> extractIdsFromCsv(String csv) {
        List<Long> ids = new ArrayList<>();
        String[] lines = csv.split("\n");
        // Skip header
        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (!line.isEmpty()) {
                String idStr = line.split(",")[0].trim();
                ids.add(Long.parseLong(idStr));
            }
        }
        return ids;
    }

    @Test
    void testA_ExportUsersCsv_SortedNumericallyAscending() {
        UserRepository userRepository = mock(UserRepository.class);
        AdminUserMapper adminUserMapper = mock(AdminUserMapper.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        ProgressRepository progressRepository = mock(ProgressRepository.class);
        SpeakingSessionRepository speakingSessionRepository = mock(SpeakingSessionRepository.class);
        UserSubscriptionRepository userSubscriptionRepository = mock(UserSubscriptionRepository.class);
        GrammarHistoryRepository grammarHistoryRepository = mock(GrammarHistoryRepository.class);
        VocabularyRepository vocabularyRepository = mock(VocabularyRepository.class);

        AdminUserServiceImpl service = new AdminUserServiceImpl(
                userRepository, adminUserMapper, passwordEncoder,
                progressRepository, speakingSessionRepository, userSubscriptionRepository,
                grammarHistoryRepository, vocabularyRepository
        );

        List<Long> inputIds = Arrays.asList(20L, 2L, 10L, 1L, 11L, 3L);
        List<User> mockUsers = new ArrayList<>();
        for (Long id : inputIds) {
            User u = new User();
            u.setId(id);
            u.setFirstName("User" + id);
            u.setLastName("Test");
            u.setEmail("user" + id + "@test.com");
            u.setRole(Role.STUDENT);
            u.setActive(true);
            u.setCreatedAt(LocalDateTime.now());
            mockUsers.add(u);
        }

        when(userRepository.findAll()).thenReturn(mockUsers);

        String csv = service.exportUsersCsv();
        List<Long> resultIds = extractIdsFromCsv(csv);

        // Numeric ascending: 1, 2, 3, 10, 11, 20 (NOT lexicographic 1, 10, 11, 2, 20, 3)
        assertEquals(Arrays.asList(1L, 2L, 3L, 10L, 11L, 20L), resultIds);
    }

    @Test
    void testB_ExportSchoolUsersCsv_SortedNumericallyAscending() {
        UserRepository userRepository = mock(UserRepository.class);
        StudentRepository studentRepository = mock(StudentRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

        AdminSchoolUserServiceImpl service = new AdminSchoolUserServiceImpl(
                userRepository, studentRepository, passwordEncoder
        );

        List<Long> inputIds = Arrays.asList(20L, 2L, 10L, 1L, 11L, 3L);
        List<Student> mockStudents = new ArrayList<>();
        for (Long id : inputIds) {
            Student s = new Student();
            s.setId(id);
            s.setFirstName("Student" + id);
            s.setLastName("Test");
            s.setEmail("student" + id + "@test.com");
            s.setPhone("9876543210");
            s.setSchoolName("Test School");
            s.setStandard("10th");
            s.setDivision("A");
            s.setRollNumber(String.valueOf(id));
            s.setParentName("Parent" + id);
            s.setParentPhone("9876543211");
            s.setActive(true);
            s.setCreatedAt(LocalDateTime.now());
            mockStudents.add(s);
        }

        when(studentRepository.findAll(any(Specification.class))).thenReturn(mockStudents);

        String csv = service.exportSchoolUsersCsv();
        List<Long> resultIds = extractIdsFromCsv(csv);

        assertEquals(Arrays.asList(1L, 2L, 3L, 10L, 11L, 20L), resultIds);
    }

    @Test
    void testC_ExportSubscriptionsCsv_SortedNumericallyAscending() {
        SubscriptionPlanRepository planRepository = mock(SubscriptionPlanRepository.class);
        UserSubscriptionRepository subscriptionRepository = mock(UserSubscriptionRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        PaymentRepository paymentRepository = mock(PaymentRepository.class);

        AdminSubscriptionServiceImpl service = new AdminSubscriptionServiceImpl(
                planRepository, subscriptionRepository, userRepository, paymentRepository
        );

        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setPlanName("Pro Plan");

        User user = new User();
        user.setFirstName("Jane");
        user.setLastName("Doe");
        user.setEmail("jane@test.com");

        List<Long> inputIds = Arrays.asList(20L, 2L, 10L, 1L, 11L, 3L);
        List<UserSubscription> mockSubs = new ArrayList<>();
        for (Long id : inputIds) {
            UserSubscription sub = new UserSubscription();
            sub.setId(id);
            sub.setUser(user);
            sub.setSubscriptionPlan(plan);
            sub.setPaymentStatus(com.rslsolution.speakmateai.enums.PaymentStatus.PAID);
            sub.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
            sub.setStartDate(LocalDateTime.now());
            sub.setExpiryDate(LocalDateTime.now().plusMonths(1));
            sub.setAmountPaid(99.0);
            mockSubs.add(sub);
        }

        when(subscriptionRepository.findAll()).thenReturn(mockSubs);

        String csv = service.exportSubscriptionsCsv();
        List<Long> resultIds = extractIdsFromCsv(csv);

        assertEquals(Arrays.asList(1L, 2L, 3L, 10L, 11L, 20L), resultIds);
    }

    @Test
    void testD_ExportBillingCsv_SortedNumericallyAscending() {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
        RefundRepository refundRepository = mock(RefundRepository.class);

        AdminBillingServiceImpl service = new AdminBillingServiceImpl(
                paymentRepository, invoiceRepository, refundRepository
        );

        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setPlanName("Premium Plan");

        User user = new User();
        user.setFirstName("Bob");
        user.setLastName("Smith");
        user.setEmail("bob@test.com");

        List<Long> inputIds = Arrays.asList(20L, 2L, 10L, 1L, 11L, 3L);
        List<Payment> mockPayments = new ArrayList<>();
        for (Long id : inputIds) {
            Payment p = new Payment();
            p.setId(id);
            p.setUser(user);
            p.setSubscriptionPlan(plan);
            p.setAmount(199.0);
            p.setCurrency("INR");
            p.setPaymentMethod(com.rslsolution.speakmateai.enums.PaymentMethod.UPI);
            p.setPaymentGateway(com.rslsolution.speakmateai.enums.PaymentGateway.RAZORPAY);
            p.setTransactionId("TXN-" + id);
            p.setPaymentStatus(PaymentStatus.PAID);
            p.setPaymentDate(LocalDateTime.now().minusDays(id));
            mockPayments.add(p);
        }

        when(paymentRepository.findAll(any(Sort.class))).thenReturn(mockPayments);

        String csv = service.exportPaymentsCsv();
        List<Long> resultIds = extractIdsFromCsv(csv);

        assertEquals(Arrays.asList(1L, 2L, 3L, 10L, 11L, 20L), resultIds);
    }

    @Test
    void testE_ExportStudentsCsv_SortedNumericallyAscending() {
        UserRepository userRepository = mock(UserRepository.class);
        StudentRepository studentRepository = mock(StudentRepository.class);
        AdminRepository adminRepository = mock(AdminRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        NotificationService notificationService = mock(NotificationService.class);

        StudentServiceImpl service = new StudentServiceImpl(
                userRepository, studentRepository, adminRepository, passwordEncoder, notificationService
        );

        // Mock current user as SUPER_ADMIN
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("admin@school.com");
        SecurityContext sec = mock(SecurityContext.class);
        when(sec.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sec);

        User currentAdmin = new User();
        currentAdmin.setId(999L);
        currentAdmin.setEmail("admin@school.com");
        currentAdmin.setRole(Role.SUPER_ADMIN);
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(currentAdmin));

        List<Long> inputIds = Arrays.asList(20L, 2L, 10L, 1L, 11L, 3L);
        List<Student> mockStudents = new ArrayList<>();
        for (Long id : inputIds) {
            Student s = new Student();
            s.setId(id);
            s.setFirstName("Student" + id);
            s.setLastName("Last" + id);
            s.setEmail("s" + id + "@school.com");
            s.setStudentId("STU-" + id);
            s.setSchoolId(1L);
            s.setStatus(com.rslsolution.speakmateai.enums.Status.ACTIVE);
            s.setCreatedAt(LocalDateTime.now());
            mockStudents.add(s);
        }

        when(studentRepository.findAll()).thenReturn(mockStudents);

        byte[] csvBytes = service.exportStudents("csv");
        String csv = new String(csvBytes);
        List<Long> resultIds = extractIdsFromCsv(csv);

        assertEquals(Arrays.asList(1L, 2L, 3L, 10L, 11L, 20L), resultIds);
    }
}
