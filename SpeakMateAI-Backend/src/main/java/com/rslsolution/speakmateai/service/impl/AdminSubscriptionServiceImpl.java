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
        long subCount = 0;
        long activeSubCount = 0;
        String billingCycle = plan.getBillingCycle();

        String pName = plan.getPlanName() != null ? plan.getPlanName().trim().toUpperCase() : "";

        if ("MONTHLY_PRO".equals(pName)) {
            subCount = subscriptionRepository.countDistinctSubscribersByPlan(plan.getId(), "MONTHLY_PRO");
            activeSubCount = subscriptionRepository.countDistinctMonthlyProSubscribers(SubscriptionStatus.ACTIVE);
            if (billingCycle == null) billingCycle = "Monthly";
        } else if ("YEARLY_PRO".equals(pName)) {
            subCount = subscriptionRepository.countDistinctSubscribersByPlan(plan.getId(), "YEARLY_PRO");
            activeSubCount = subscriptionRepository.countDistinctAnnualProSubscribers(SubscriptionStatus.ACTIVE);
            if (billingCycle == null) billingCycle = "Annual";
        } else if ("FREE_STARTER".equals(pName) || "FREE".equals(pName)) {
            long activePro = subscriptionRepository.countDistinctActiveProSubscribers(SubscriptionStatus.ACTIVE);
            subCount = Math.max(0, userRepository.count() - activePro);
            activeSubCount = subCount;
            if (billingCycle == null) billingCycle = "Lifetime Free";
        } else {
            subCount = subscriptionRepository.countDistinctSubscribersByPlan(plan.getId(), plan.getPlanName());
            activeSubCount = subscriptionRepository.countDistinctActiveSubscribersByPlan(plan.getId(), plan.getPlanName(), SubscriptionStatus.ACTIVE);
            if (billingCycle == null) {
                if (plan.getDurationMonths() != null && plan.getDurationMonths() == 12) {
                    billingCycle = "Annual";
                } else if (plan.getDurationMonths() != null && plan.getDurationMonths() == 1) {
                    billingCycle = "Monthly";
                } else if (plan.getDurationMonths() != null && plan.getDurationMonths() == 0) {
                    billingCycle = "Lifetime";
                } else if (plan.getDurationMonths() != null) {
                    billingCycle = plan.getDurationMonths() + " Months";
                } else {
                    billingCycle = "Custom";
                }
            }
        }

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
                .aiMinutesLimit(plan.getAiMinutesLimit())
                .isActive(plan.getIsActive())
                .subscriberCount(subCount)
                .activeSubscriberCount(activeSubCount)
                .billingCycle(billingCycle)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }

    private UserSubscriptionResponse mapToSubscriptionResponse(UserSubscription sub) {
        Long planId = null;
        String planName = null;

        if (sub.getSubscriptionPlan() != null) {
            planId = sub.getSubscriptionPlan().getId();
            planName = sub.getSubscriptionPlan().getPlanName();
        } else if (sub.getPlanType() != null) {
            java.util.Optional<SubscriptionPlan> resolved = planRepository.findByPlanNameIgnoreCase(sub.getPlanType().trim());
            if (resolved.isPresent()) {
                planId = resolved.get().getId();
                planName = resolved.get().getPlanName();
            } else {
                planName = sub.getPlanType();
            }
        } else {
            planName = "Unknown Plan";
        }

        LocalDateTime expiryDate = sub.getExpiryDate() != null ? sub.getExpiryDate() : sub.getEndDate();
        Double amountPaid = sub.getAmountPaid() != null ? sub.getAmountPaid()
                : (sub.getAmount() != null ? sub.getAmount().doubleValue() : null);

        SubscriptionStatus subStatus = sub.getSubscriptionStatus();
        if (subStatus == null && sub.getStatus() != null) {
            try {
                subStatus = SubscriptionStatus.valueOf(sub.getStatus().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        PaymentStatus payStatus = sub.getPaymentStatus();
        if (payStatus == null && sub.getStatus() != null) {
            if ("ACTIVE".equalsIgnoreCase(sub.getStatus())) {
                payStatus = PaymentStatus.PAID;
            } else if ("PENDING".equalsIgnoreCase(sub.getStatus())) {
                payStatus = PaymentStatus.PENDING;
            }
        }

        String firstName = "";
        String lastName = "";
        String email = "";
        Long userId = null;
        com.rslsolution.speakmateai.enums.Role userRole = null;
        if (sub.getUser() != null) {
            userId = sub.getUser().getId();
            firstName = sub.getUser().getFirstName() != null ? sub.getUser().getFirstName() : "";
            lastName = sub.getUser().getLastName() != null ? sub.getUser().getLastName() : "";
            email = sub.getUser().getEmail() != null ? sub.getUser().getEmail() : "";
            userRole = sub.getUser().getRole();
        }

        return UserSubscriptionResponse.builder()
                .id(sub.getId())
                .userId(userId)
                .userFirstName(firstName)
                .userLastName(lastName)
                .userEmail(email)
                .userRole(userRole)
                .accountType("USER")
                .planId(planId)
                .planName(planName)
                .startDate(sub.getStartDate())
                .expiryDate(expiryDate)
                .paymentStatus(payStatus)
                .subscriptionStatus(subStatus)
                .paymentMethod(sub.getPaymentMethod())
                .transactionId(sub.getTransactionId())
                .amountPaid(amountPaid)
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
        String requestedName = request.getPlanName() != null ? request.getPlanName().trim().toUpperCase() : "";
        if ("MONTHLY_PRO".equals(requestedName) || "YEARLY_PRO".equals(requestedName) || "FREE".equals(requestedName) || "FREE_STARTER".equals(requestedName)) {
            throw new IllegalArgumentException("Plan identifier '" + request.getPlanName() + "' is reserved for core SpeakMate learner plans.");
        }

        if (request.getPlanName() == null || request.getPlanName().trim().isEmpty()) {
            throw new IllegalArgumentException("Plan name is required");
        }

        if (planRepository.existsByPlanNameIgnoreCase(request.getPlanName().trim())) {
            throw new IllegalArgumentException("A plan with this name already exists");
        }

        if (request.getPrice() == null || request.getPrice() < 0) {
            throw new IllegalArgumentException("Valid price is required (0 or greater)");
        }

        if (request.getCurrency() == null || request.getCurrency().trim().isEmpty()) {
            throw new IllegalArgumentException("Currency is required");
        }

        // Validate billing cycle & duration consistency (supported: MONTHLY, YEARLY, LIFETIME)
        String cycle = request.getBillingCycle() != null ? request.getBillingCycle().trim().toUpperCase() : null;
        Integer duration = request.getDurationMonths();

        if (cycle != null && !cycle.isEmpty()) {
            if (!"MONTHLY".equals(cycle) && !"YEARLY".equals(cycle) && !"LIFETIME".equals(cycle)) {
                throw new IllegalArgumentException("Unsupported billing cycle: '" + cycle + "'. Supported cycles are: MONTHLY, YEARLY, LIFETIME.");
            }
            if ("MONTHLY".equals(cycle)) {
                if (duration == null) duration = 1;
                else if (duration != 1) {
                    throw new IllegalArgumentException("Duration for MONTHLY billing cycle must be 1 month.");
                }
            } else if ("YEARLY".equals(cycle)) {
                if (duration == null) duration = 12;
                else if (duration != 12) {
                    throw new IllegalArgumentException("Duration for YEARLY billing cycle must be 12 months.");
                }
            } else if ("LIFETIME".equals(cycle)) {
                if (duration == null) duration = 0;
                else if (duration != 0) {
                    throw new IllegalArgumentException("Duration for LIFETIME billing cycle must be 0 months.");
                }
            }
        } else {
            if (duration == null) {
                throw new IllegalArgumentException("Duration is required");
            }
            if (duration == 1) {
                cycle = "MONTHLY";
            } else if (duration == 12) {
                cycle = "YEARLY";
            } else if (duration == 0) {
                cycle = "LIFETIME";
            } else {
                throw new IllegalArgumentException("Duration of " + duration + " months is unsupported. Supported durations: 1 (MONTHLY), 12 (YEARLY), 0 (LIFETIME).");
            }
        }

        validateUsageLimits(request.getMaxLessons(), request.getMaxTests(), request.getAiPracticeLimit(),
                request.getGrammarPracticeLimit(), request.getSpeakingPracticeLimit(), request.getVocabularyPracticeLimit(),
                request.getAiMinutesLimit());
        
        SubscriptionPlan plan = SubscriptionPlan.builder()
                .planName(request.getPlanName().trim())
                .description(request.getDescription())
                .durationMonths(duration)
                .billingCycle(cycle)
                .price(request.getPrice())
                .currency(request.getCurrency().trim().toUpperCase())
                .features(request.getFeatures())
                .maxLessons(request.getMaxLessons())
                .maxTests(request.getMaxTests())
                .aiPracticeLimit(request.getAiPracticeLimit())
                .grammarPracticeLimit(request.getGrammarPracticeLimit())
                .speakingPracticeLimit(request.getSpeakingPracticeLimit())
                .vocabularyPracticeLimit(request.getVocabularyPracticeLimit())
                .aiMinutesLimit(request.getAiMinutesLimit())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return mapToPlanResponse(planRepository.save(plan));
    }

    private void validateUsageLimits(Integer maxLessons, Integer maxTests, Integer aiPracticeLimit,
                                     Integer grammarPracticeLimit, Integer speakingPracticeLimit,
                                     Integer vocabularyPracticeLimit, Integer aiMinutesLimit) {
        if (maxLessons != null && maxLessons < 0) throw new IllegalArgumentException("Max lessons limit cannot be negative.");
        if (maxTests != null && maxTests < 0) throw new IllegalArgumentException("Max tests limit cannot be negative.");
        if (aiPracticeLimit != null && aiPracticeLimit < 0) throw new IllegalArgumentException("AI practice limit cannot be negative.");
        if (grammarPracticeLimit != null && grammarPracticeLimit < 0) throw new IllegalArgumentException("Grammar practice limit cannot be negative.");
        if (speakingPracticeLimit != null && speakingPracticeLimit < 0) throw new IllegalArgumentException("Speaking practice limit cannot be negative.");
        if (vocabularyPracticeLimit != null && vocabularyPracticeLimit < 0) throw new IllegalArgumentException("Vocabulary practice limit cannot be negative.");
        if (aiMinutesLimit != null && aiMinutesLimit < 0) throw new IllegalArgumentException("AI minutes limit cannot be negative.");
    }

    @Override
    public SubscriptionPlanResponse updatePlan(Long id, SubscriptionPlanUpdateRequest request) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription Plan not found"));

        String currentUpper = plan.getPlanName() != null ? plan.getPlanName().trim().toUpperCase() : "";
        boolean isCoreSystemPlan = "MONTHLY_PRO".equals(currentUpper) || "YEARLY_PRO".equals(currentUpper) || "FREE".equals(currentUpper) || "FREE_STARTER".equals(currentUpper);

        if (isCoreSystemPlan) {
            // Protect core system identifier
            if (request.getPlanName() != null && !plan.getPlanName().equalsIgnoreCase(request.getPlanName().trim())) {
                throw new IllegalArgumentException("Plan identifier for core learner plan '" + plan.getPlanName() + "' is system-protected and cannot be modified.");
            }
            // Protect core pricing
            if (request.getPrice() != null && Math.abs(request.getPrice() - plan.getPrice()) > 0.001) {
                throw new IllegalArgumentException("Pricing for core learner plan '" + plan.getPlanName() + "' is system-protected and cannot be modified through Admin.");
            }
            // Protect duration
            if (request.getDurationMonths() != null && !request.getDurationMonths().equals(plan.getDurationMonths())) {
                throw new IllegalArgumentException("Duration for core learner plan '" + plan.getPlanName() + "' is system-protected and cannot be modified.");
            }
            // Protect currency
            if (request.getCurrency() != null && !request.getCurrency().trim().equalsIgnoreCase(plan.getCurrency())) {
                throw new IllegalArgumentException("Currency for core learner plan '" + plan.getPlanName() + "' is system-protected.");
            }
            // Protect billing cycle
            if (request.getBillingCycle() != null && plan.getBillingCycle() != null 
                    && !request.getBillingCycle().trim().equalsIgnoreCase(plan.getBillingCycle())) {
                throw new IllegalArgumentException("Billing cycle for core learner plan '" + plan.getPlanName() + "' is system-protected and cannot be modified.");
            }
            // Protect usage limits
            if (request.getMaxLessons() != null && !request.getMaxLessons().equals(plan.getMaxLessons())) {
                throw new IllegalArgumentException("Learner usage limits for core learner plan '" + plan.getPlanName() + "' are system-protected and cannot be modified through Admin.");
            }
            if (request.getMaxTests() != null && !request.getMaxTests().equals(plan.getMaxTests())) {
                throw new IllegalArgumentException("Learner usage limits for core learner plan '" + plan.getPlanName() + "' are system-protected and cannot be modified through Admin.");
            }
            if (request.getAiPracticeLimit() != null && !request.getAiPracticeLimit().equals(plan.getAiPracticeLimit())) {
                throw new IllegalArgumentException("Learner usage limits for core learner plan '" + plan.getPlanName() + "' are system-protected and cannot be modified through Admin.");
            }
            if (request.getGrammarPracticeLimit() != null && !request.getGrammarPracticeLimit().equals(plan.getGrammarPracticeLimit())) {
                throw new IllegalArgumentException("Learner usage limits for core learner plan '" + plan.getPlanName() + "' are system-protected and cannot be modified through Admin.");
            }
            if (request.getSpeakingPracticeLimit() != null && !request.getSpeakingPracticeLimit().equals(plan.getSpeakingPracticeLimit())) {
                throw new IllegalArgumentException("Learner usage limits for core learner plan '" + plan.getPlanName() + "' are system-protected and cannot be modified through Admin.");
            }
            if (request.getVocabularyPracticeLimit() != null && !request.getVocabularyPracticeLimit().equals(plan.getVocabularyPracticeLimit())) {
                throw new IllegalArgumentException("Learner usage limits for core learner plan '" + plan.getPlanName() + "' are system-protected and cannot be modified through Admin.");
            }
            if (request.getAiMinutesLimit() != null && !request.getAiMinutesLimit().equals(plan.getAiMinutesLimit())) {
                throw new IllegalArgumentException("Learner usage limits for core learner plan '" + plan.getPlanName() + "' are system-protected and cannot be modified through Admin.");
            }
        } else {
            String requestedName = request.getPlanName() != null ? request.getPlanName().trim().toUpperCase() : "";
            if ("MONTHLY_PRO".equals(requestedName) || "YEARLY_PRO".equals(requestedName) || "FREE".equals(requestedName) || "FREE_STARTER".equals(requestedName)) {
                throw new IllegalArgumentException("Plan identifier '" + request.getPlanName() + "' is reserved for core SpeakMate learner plans.");
            }

            if (!plan.getPlanName().equalsIgnoreCase(request.getPlanName().trim()) && 
                planRepository.existsByPlanNameIgnoreCase(request.getPlanName().trim())) {
                throw new IllegalArgumentException("A plan with this name already exists");
            }

            if (request.getPrice() != null && request.getPrice() < 0) {
                throw new IllegalArgumentException("Valid price is required (0 or greater)");
            }

            // Billing cycle & duration consistency
            String cycle = request.getBillingCycle() != null ? request.getBillingCycle().trim().toUpperCase() : plan.getBillingCycle();
            Integer duration = request.getDurationMonths() != null ? request.getDurationMonths() : plan.getDurationMonths();

            if (cycle != null && !cycle.isEmpty()) {
                if (!"MONTHLY".equals(cycle) && !"YEARLY".equals(cycle) && !"LIFETIME".equals(cycle)) {
                    throw new IllegalArgumentException("Unsupported billing cycle: '" + cycle + "'. Supported cycles are: MONTHLY, YEARLY, LIFETIME.");
                }
                if ("MONTHLY".equals(cycle)) {
                    duration = 1;
                } else if ("YEARLY".equals(cycle)) {
                    duration = 12;
                } else if ("LIFETIME".equals(cycle)) {
                    duration = 0;
                }
            } else if (duration != null) {
                if (duration == 1) cycle = "MONTHLY";
                else if (duration == 12) cycle = "YEARLY";
                else if (duration == 0) cycle = "LIFETIME";
                else throw new IllegalArgumentException("Duration of " + duration + " months is unsupported. Supported durations: 1 (MONTHLY), 12 (YEARLY), 0 (LIFETIME).");
            }

            validateUsageLimits(request.getMaxLessons(), request.getMaxTests(), request.getAiPracticeLimit(),
                    request.getGrammarPracticeLimit(), request.getSpeakingPracticeLimit(), request.getVocabularyPracticeLimit(),
                    request.getAiMinutesLimit());

            plan.setPlanName(request.getPlanName().trim());
            plan.setDurationMonths(duration);
            plan.setBillingCycle(cycle);
            if (request.getPrice() != null) plan.setPrice(request.getPrice());
            if (request.getCurrency() != null) plan.setCurrency(request.getCurrency().trim().toUpperCase());
            plan.setMaxLessons(request.getMaxLessons());
            plan.setMaxTests(request.getMaxTests());
            plan.setAiPracticeLimit(request.getAiPracticeLimit());
            plan.setGrammarPracticeLimit(request.getGrammarPracticeLimit());
            plan.setSpeakingPracticeLimit(request.getSpeakingPracticeLimit());
            plan.setVocabularyPracticeLimit(request.getVocabularyPracticeLimit());
            plan.setAiMinutesLimit(request.getAiMinutesLimit());
        }

        if (request.getDescription() != null) {
            plan.setDescription(request.getDescription().trim());
        }
        if (request.getFeatures() != null) {
            plan.setFeatures(request.getFeatures().trim());
        }
        
        if (request.getIsActive() != null) {
            plan.setIsActive(request.getIsActive());
        }

        return mapToPlanResponse(planRepository.save(plan));
    }

    @Override
    public void deletePlan(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription Plan not found"));
        String planUpper = plan.getPlanName() != null ? plan.getPlanName().trim().toUpperCase() : "";
        if ("MONTHLY_PRO".equals(planUpper) || "YEARLY_PRO".equals(planUpper) || "FREE".equals(planUpper) || "FREE_STARTER".equals(planUpper)) {
            throw new IllegalArgumentException("Core learner plan '" + plan.getPlanName() + "' cannot be deleted.");
        }
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

        if (user.getRole() != null && user.getRole() != com.rslsolution.speakmateai.enums.Role.USER) {
            throw new IllegalArgumentException("Subscriptions can only be assigned to individual platform learners (Role.USER). "
                    + user.getRole() + " accounts cannot hold learner subscriptions.");
        }
                
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

        SubscriptionPlan plan = oldSub.getSubscriptionPlan();
        if (plan == null && oldSub.getPlanType() != null) {
            plan = planRepository.findByPlanNameIgnoreCase(oldSub.getPlanType().trim()).orElse(null);
        }

        int durationMonths = (plan != null && plan.getDurationMonths() != null) ? plan.getDurationMonths() : 1;

        UserSubscription newSub = UserSubscription.builder()
                .user(oldSub.getUser())
                .subscriptionPlan(plan)
                .planType(oldSub.getPlanType() != null ? oldSub.getPlanType() : (plan != null ? plan.getPlanName() : "MONTHLY_PRO"))
                .startDate(LocalDateTime.now())
                .expiryDate(LocalDateTime.now().plusMonths(durationMonths))
                .endDate(LocalDateTime.now().plusMonths(durationMonths))
                .paymentStatus(PaymentStatus.PAID)
                .subscriptionStatus(SubscriptionStatus.ACTIVE)
                .status("ACTIVE")
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
        Specification<UserSubscription> spec = SubscriptionSpecification.onlyLearnerUsers();
        return subscriptionRepository.findAll(spec, pageable).map(this::mapToSubscriptionResponse);
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
            String userName = "Unknown";
            String email = "";
            if (sub.getUser() != null) {
                String fn = sub.getUser().getFirstName() != null ? sub.getUser().getFirstName() : "";
                String ln = sub.getUser().getLastName() != null ? sub.getUser().getLastName() : "";
                userName = (fn + " " + ln).trim();
                email = sub.getUser().getEmail() != null ? sub.getUser().getEmail() : "";
            }

            String planName;
            if (sub.getSubscriptionPlan() != null && sub.getSubscriptionPlan().getPlanName() != null) {
                planName = sub.getSubscriptionPlan().getPlanName();
            } else if (sub.getPlanType() != null) {
                planName = sub.getPlanType();
            } else {
                planName = "Unknown";
            }

            LocalDateTime expiry = sub.getExpiryDate() != null ? sub.getExpiryDate() : sub.getEndDate();
            Double amountPaid = sub.getAmountPaid() != null ? sub.getAmountPaid()
                    : (sub.getAmount() != null ? sub.getAmount().doubleValue() : 0.0);

            String payStatus = sub.getPaymentStatus() != null ? sub.getPaymentStatus().name()
                    : ("ACTIVE".equalsIgnoreCase(sub.getStatus()) ? "PAID" : (sub.getStatus() != null ? sub.getStatus() : ""));
            String subStatus = sub.getSubscriptionStatus() != null ? sub.getSubscriptionStatus().name()
                    : (sub.getStatus() != null ? sub.getStatus() : "");

            csv.append(sub.getId()).append(",")
               .append(escapeCsv(userName)).append(",")
               .append(escapeCsv(email)).append(",")
               .append(escapeCsv(planName)).append(",")
               .append(escapeCsv(payStatus)).append(",")
               .append(escapeCsv(subStatus)).append(",")
               .append(sub.getStartDate()).append(",")
               .append(expiry).append(",")
               .append(amountPaid).append("\n");
        }
        return csv.toString();
    }

    private String escapeCsv(String data) {
        if (data == null) return "";
        if (data.contains(",") || data.contains("\"") || data.contains("\n")) {
            return "\"" + data.replace("\"", "\"\"") + "\"";
        }
        return data;
    }

    @Override
    public SubscriptionStatisticsResponse getStatistics() {
        long totalPlans = planRepository.count();
        long activePlans = planRepository.countByIsActiveTrue();
        long inactivePlans = planRepository.countByIsActiveFalse();
        
        long totalSubs = subscriptionRepository.count();
        long distinctSubscribers = subscriptionRepository.countDistinctSubscribers();
        long activeProSubscribers = subscriptionRepository.countDistinctActiveProSubscribers(SubscriptionStatus.ACTIVE);
        long monthlyProSubscribers = subscriptionRepository.countDistinctMonthlyProSubscribers(SubscriptionStatus.ACTIVE);
        long annualProSubscribers = subscriptionRepository.countDistinctAnnualProSubscribers(SubscriptionStatus.ACTIVE);
        
        long expiredSubs = subscriptionRepository.countBySubscriptionStatus(SubscriptionStatus.EXPIRED);
        long cancelledSubs = subscriptionRepository.countBySubscriptionStatus(SubscriptionStatus.CANCELLED);
        
        long learnerUsers = userRepository.countByRole(com.rslsolution.speakmateai.enums.Role.USER);
        long totalUsers = learnerUsers > 0 ? learnerUsers : userRepository.count();
        long freeUsers = Math.max(0, totalUsers - activeProSubscribers);
        
        double conversionRate = totalUsers > 0 ? ((double) activeProSubscribers / totalUsers) * 100.0 : 0.0;
        conversionRate = Math.round(conversionRate * 100.0) / 100.0;

        // Revenue from actual Payment records
        Double paidRev = paymentRepository.sumTotalRevenue();
        double totalRev = paidRev != null ? paidRev : 0.0;

        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Double monthlyRev = paymentRepository.sumRevenueSince(monthStart);
        if (monthlyRev == null) {
            monthlyRev = 0.0;
        }

        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        Double todayRev = paymentRepository.sumRevenueSince(todayStart);
        if (todayRev == null) {
            todayRev = 0.0;
        }

        long totalPayments = paymentRepository.count();
        long successfulPayments = paymentRepository.countByPaymentStatus(PaymentStatus.PAID);

        return SubscriptionStatisticsResponse.builder()
                .totalSubscriptionPlans(totalPlans)
                .activePlans(activePlans)
                .inactivePlans(inactivePlans)
                .totalSubscribers(distinctSubscribers > 0 ? distinctSubscribers : totalSubs)
                .activeSubscribers(activeProSubscribers)
                .activeProSubscribers(activeProSubscribers)
                .totalUsers(totalUsers)
                .freeUsers(freeUsers)
                .monthlyProSubscribers(monthlyProSubscribers)
                .annualProSubscribers(annualProSubscribers)
                .conversionRate(conversionRate)
                .freeStarterCount(freeUsers)
                .monthlyProCount(monthlyProSubscribers)
                .annualProCount(annualProSubscribers)
                .totalPayments(totalPayments)
                .successfulPayments(successfulPayments)
                .expiredSubscriptions(expiredSubs)
                .cancelledSubscriptions(cancelledSubs)
                .totalRevenue(totalRev)
                .monthlyRevenue(monthlyRev)
                .todaysRevenue(todayRev)
                .build();
    }
}
