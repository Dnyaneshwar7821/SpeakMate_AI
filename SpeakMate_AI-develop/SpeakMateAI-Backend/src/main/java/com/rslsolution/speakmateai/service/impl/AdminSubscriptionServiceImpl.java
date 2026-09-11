package com.rslsolution.speakmateai.service.impl;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.SubscriptionPlanCreateRequest;
import com.rslsolution.speakmateai.dto.request.SubscriptionPlanUpdateRequest;
import com.rslsolution.speakmateai.dto.response.SubscriptionPlanResponse;
import com.rslsolution.speakmateai.dto.response.SubscriptionStatisticsResponse;
import com.rslsolution.speakmateai.dto.response.UserSubscriptionResponse;
import com.rslsolution.speakmateai.entity.SubscriptionPlan;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.UserSubscription;
import com.rslsolution.speakmateai.enums.PaymentMethod;
import com.rslsolution.speakmateai.enums.PaymentStatus;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;
import com.rslsolution.speakmateai.repository.SubscriptionPlanRepository;
import com.rslsolution.speakmateai.repository.SubscriptionSpecification;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;
import com.rslsolution.speakmateai.service.AdminSubscriptionService;

@Service
@Transactional
public class AdminSubscriptionServiceImpl implements AdminSubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final UserSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final com.rslsolution.speakmateai.repository.PaymentRepository paymentRepository;

    public AdminSubscriptionServiceImpl(SubscriptionPlanRepository planRepository, 
                                        UserSubscriptionRepository subscriptionRepository,
                                        UserRepository userRepository,
                                        com.rslsolution.speakmateai.repository.PaymentRepository paymentRepository) {
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }

    private SubscriptionPlanResponse mapToPlanResponse(SubscriptionPlan plan) {
        return SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .planName(plan.getPlanName())
                .description(plan.getDescription())
                .durationMonths(plan.getDurationMonths())
                .price(plan.getPrice())
                .currency(plan.getCurrency())
                .features(plan.getFeatures())
                .maxLessons(plan.getMaxLessons())
                .maxTests(plan.getMaxTests())
                .aiPracticeLimit(plan.getAiPracticeLimit())
                .grammarPracticeLimit(plan.getGrammarPracticeLimit())
                .speakingPracticeLimit(plan.getSpeakingPracticeLimit())
                .vocabularyPracticeLimit(plan.getVocabularyPracticeLimit())
                .isActive(plan.getIsActive())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }

    private UserSubscriptionResponse mapToSubscriptionResponse(UserSubscription sub) {
        return UserSubscriptionResponse.builder()
                .id(sub.getId())
                .userId(sub.getUser().getId())
                .userFirstName(sub.getUser().getFirstName())
                .userLastName(sub.getUser().getLastName())
                .userEmail(sub.getUser().getEmail())
                .planId(sub.getSubscriptionPlan().getId())
                .planName(sub.getSubscriptionPlan().getPlanName())
                .startDate(sub.getStartDate())
                .expiryDate(sub.getExpiryDate())
                .paymentStatus(sub.getPaymentStatus())
                .subscriptionStatus(sub.getSubscriptionStatus())
                .paymentMethod(sub.getPaymentMethod())
                .transactionId(sub.getTransactionId())
                .amountPaid(sub.getAmountPaid())
                .createdAt(sub.getCreatedAt())
                .updatedAt(sub.getUpdatedAt())
                .build();
    }

    @Override
    public Page<SubscriptionPlanResponse> getAllPlans(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return planRepository.findAll(pageable).map(this::mapToPlanResponse);
    }

    @Override
    public SubscriptionPlanResponse getPlanById(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription Plan not found"));
        return mapToPlanResponse(plan);
    }

    @Override
    public SubscriptionPlanResponse createPlan(SubscriptionPlanCreateRequest request) {
        if (planRepository.existsByPlanNameIgnoreCase(request.getPlanName())) {
            throw new IllegalArgumentException("A plan with this name already exists");
        }
        
        SubscriptionPlan plan = SubscriptionPlan.builder()
                .planName(request.getPlanName())
                .description(request.getDescription())
                .durationMonths(request.getDurationMonths())
                .price(request.getPrice())
                .currency(request.getCurrency())
                .features(request.getFeatures())
                .maxLessons(request.getMaxLessons())
                .maxTests(request.getMaxTests())
                .aiPracticeLimit(request.getAiPracticeLimit())
                .grammarPracticeLimit(request.getGrammarPracticeLimit())
                .speakingPracticeLimit(request.getSpeakingPracticeLimit())
                .vocabularyPracticeLimit(request.getVocabularyPracticeLimit())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return mapToPlanResponse(planRepository.save(plan));
    }

    @Override
    public SubscriptionPlanResponse updatePlan(Long id, SubscriptionPlanUpdateRequest request) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription Plan not found"));

        if (!plan.getPlanName().equalsIgnoreCase(request.getPlanName()) && 
            planRepository.existsByPlanNameIgnoreCase(request.getPlanName())) {
            throw new IllegalArgumentException("A plan with this name already exists");
        }

        plan.setPlanName(request.getPlanName());
        plan.setDescription(request.getDescription());
        plan.setDurationMonths(request.getDurationMonths());
        plan.setPrice(request.getPrice());
        plan.setCurrency(request.getCurrency());
        plan.setFeatures(request.getFeatures());
        plan.setMaxLessons(request.getMaxLessons());
        plan.setMaxTests(request.getMaxTests());
        plan.setAiPracticeLimit(request.getAiPracticeLimit());
        plan.setGrammarPracticeLimit(request.getGrammarPracticeLimit());
        plan.setSpeakingPracticeLimit(request.getSpeakingPracticeLimit());
        plan.setVocabularyPracticeLimit(request.getVocabularyPracticeLimit());
        
        if (request.getIsActive() != null) {
            plan.setIsActive(request.getIsActive());
        }

        return mapToPlanResponse(planRepository.save(plan));
    }

    @Override
    public void deletePlan(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription Plan not found"));
        // Soft delete by deactivating to avoid breaking existing user subscriptions
        plan.setIsActive(false);
        planRepository.save(plan);
    }

    @Override
    public SubscriptionPlanResponse activatePlan(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription Plan not found"));
        plan.setIsActive(true);
        return mapToPlanResponse(planRepository.save(plan));
    }

    @Override
    public SubscriptionPlanResponse deactivatePlan(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription Plan not found"));
        plan.setIsActive(false);
        return mapToPlanResponse(planRepository.save(plan));
    }

    @Override
    public UserSubscriptionResponse assignPlanToUser(Long userId, Long planId, PaymentMethod paymentMethod, Double amountPaid, String transactionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription Plan not found"));

        if (!plan.getIsActive()) {
            throw new IllegalArgumentException("Cannot assign an inactive subscription plan");
        }
        
        // Expire current active plan if exists
        subscriptionRepository.findFirstByUserIdAndSubscriptionStatus(userId, SubscriptionStatus.ACTIVE)
            .ifPresent(existingSub -> {
                existingSub.setSubscriptionStatus(SubscriptionStatus.EXPIRED);
                subscriptionRepository.save(existingSub);
            });

        UserSubscription subscription = UserSubscription.builder()
                .user(user)
                .subscriptionPlan(plan)
                .startDate(LocalDateTime.now())
                .expiryDate(LocalDateTime.now().plusMonths(plan.getDurationMonths()))
                .paymentStatus(PaymentStatus.PAID)
                .subscriptionStatus(SubscriptionStatus.ACTIVE)
                .paymentMethod(paymentMethod)
                .transactionId(transactionId)
                .amountPaid(amountPaid)
                .build();
                
        com.rslsolution.speakmateai.entity.Payment newPayment = com.rslsolution.speakmateai.entity.Payment.builder()
                .user(user)
                .subscriptionPlan(plan)
                .amount(amountPaid)
                .currency(plan.getCurrency())
                .paymentMethod(paymentMethod)
                .paymentGateway(com.rslsolution.speakmateai.enums.PaymentGateway.MANUAL)
                .transactionId(transactionId)
                .paymentStatus(PaymentStatus.PAID)
                .paymentDate(LocalDateTime.now())
                .remarks("Created via subscription assignment")
                .build();
        paymentRepository.save(newPayment);

        return mapToSubscriptionResponse(subscriptionRepository.save(subscription));
    }

    @Override
    public UserSubscriptionResponse renewSubscription(Long subscriptionId, PaymentMethod paymentMethod, Double amountPaid, String transactionId) {
        UserSubscription oldSub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
                
        if (oldSub.getSubscriptionStatus() == SubscriptionStatus.ACTIVE) {
            oldSub.setSubscriptionStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(oldSub);
        }

        UserSubscription newSub = UserSubscription.builder()
                .user(oldSub.getUser())
                .subscriptionPlan(oldSub.getSubscriptionPlan())
                .startDate(LocalDateTime.now())
                .expiryDate(LocalDateTime.now().plusMonths(oldSub.getSubscriptionPlan().getDurationMonths()))
                .paymentStatus(PaymentStatus.PAID)
                .subscriptionStatus(SubscriptionStatus.ACTIVE)
                .paymentMethod(paymentMethod)
                .transactionId(transactionId)
                .amountPaid(amountPaid)
                .build();
                
        return mapToSubscriptionResponse(subscriptionRepository.save(newSub));
    }

    @Override
    public UserSubscriptionResponse cancelSubscription(Long subscriptionId) {
        UserSubscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
        sub.setSubscriptionStatus(SubscriptionStatus.CANCELLED);
        sub.setExpiryDate(LocalDateTime.now());
        return mapToSubscriptionResponse(subscriptionRepository.save(sub));
    }

    @Override
    public Page<UserSubscriptionResponse> getUserSubscriptions(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return subscriptionRepository.findAll(pageable).map(this::mapToSubscriptionResponse);
    }

    @Override
    public Page<SubscriptionPlanResponse> searchPlans(String keyword, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<SubscriptionPlan> spec = SubscriptionSpecification.filterPlans(keyword, null);
        return planRepository.findAll(spec, pageable).map(this::mapToPlanResponse);
    }

    @Override
    public Page<UserSubscriptionResponse> filterSubscriptions(
            String keyword, PaymentStatus paymentStatus, SubscriptionStatus subscriptionStatus,
            PaymentMethod paymentMethod, LocalDateTime startDate, LocalDateTime endDate,
            int page, int size, String sortBy, String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Specification<UserSubscription> spec = SubscriptionSpecification.filterUserSubscriptions(
                keyword, paymentStatus, subscriptionStatus, paymentMethod, startDate, endDate);
                
        return subscriptionRepository.findAll(spec, pageable).map(this::mapToSubscriptionResponse);
    }

    @Override
    public String exportSubscriptionsCsv() {
        java.util.List<UserSubscription> subscriptions = subscriptionRepository.findAll();
        subscriptions.sort(Comparator.comparing(UserSubscription::getId, Comparator.nullsLast(Comparator.naturalOrder())));
        StringBuilder csv = new StringBuilder();
        csv.append("ID,User Name,Email,Plan Name,Payment Status,Subscription Status,Start Date,Expiry Date,Amount Paid\n");
        
        for (UserSubscription sub : subscriptions) {
            csv.append(sub.getId()).append(",")
               .append(sub.getUser().getFirstName()).append(" ").append(sub.getUser().getLastName()).append(",")
               .append(sub.getUser().getEmail()).append(",")
               .append(sub.getSubscriptionPlan().getPlanName()).append(",")
               .append(sub.getPaymentStatus()).append(",")
               .append(sub.getSubscriptionStatus()).append(",")
               .append(sub.getStartDate()).append(",")
               .append(sub.getExpiryDate()).append(",")
               .append(sub.getAmountPaid()).append("\n");
        }
        return csv.toString();
    }

    @Override
    public SubscriptionStatisticsResponse getStatistics() {
        long totalPlans = planRepository.count();
        long activePlans = planRepository.countByIsActiveTrue();
        long inactivePlans = planRepository.countByIsActiveFalse();
        
        long totalSubs = subscriptionRepository.count();
        long activeSubs = subscriptionRepository.countBySubscriptionStatus(SubscriptionStatus.ACTIVE);
        long expiredSubs = subscriptionRepository.countBySubscriptionStatus(SubscriptionStatus.EXPIRED);
        long cancelledSubs = subscriptionRepository.countBySubscriptionStatus(SubscriptionStatus.CANCELLED);
        
        Double totalRev = subscriptionRepository.sumTotalRevenue();
        
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Double monthlyRev = subscriptionRepository.sumRevenueSince(monthStart);
        
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        Double todayRev = subscriptionRepository.sumRevenueSince(todayStart);

        return SubscriptionStatisticsResponse.builder()
                .totalSubscriptionPlans(totalPlans)
                .activePlans(activePlans)
                .inactivePlans(inactivePlans)
                .totalSubscribers(totalSubs)
                .activeSubscribers(activeSubs)
                .expiredSubscriptions(expiredSubs)
                .cancelledSubscriptions(cancelledSubs)
                .totalRevenue(totalRev != null ? totalRev : 0.0)
                .monthlyRevenue(monthlyRev != null ? monthlyRev : 0.0)
                .todaysRevenue(todayRev != null ? todayRev : 0.0)
                .build();
    }
}
