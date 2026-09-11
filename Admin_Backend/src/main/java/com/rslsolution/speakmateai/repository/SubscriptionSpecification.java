package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.rslsolution.speakmateai.entity.SubscriptionPlan;
import com.rslsolution.speakmateai.entity.UserSubscription;
import com.rslsolution.speakmateai.enums.PaymentMethod;
import com.rslsolution.speakmateai.enums.PaymentStatus;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;

public class SubscriptionSpecification {

    public static Specification<SubscriptionPlan> filterPlans(String keyword, Boolean isActive) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String searchPattern = "%" + keyword.toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("planName")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(nameMatch, descMatch));
            }

            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<UserSubscription> filterUserSubscriptions(
            String keyword, PaymentStatus paymentStatus, SubscriptionStatus subscriptionStatus,
            PaymentMethod paymentMethod, LocalDateTime startDate, LocalDateTime endDate) {
        
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String searchPattern = "%" + keyword.toLowerCase() + "%";
                Join<Object, Object> userJoin = root.join("user");
                Join<Object, Object> planJoin = root.join("subscriptionPlan");
                
                Predicate firstNameMatch = cb.like(cb.lower(userJoin.get("firstName")), searchPattern);
                Predicate lastNameMatch = cb.like(cb.lower(userJoin.get("lastName")), searchPattern);
                Predicate emailMatch = cb.like(cb.lower(userJoin.get("email")), searchPattern);
                Predicate planNameMatch = cb.like(cb.lower(planJoin.get("planName")), searchPattern);
                Predicate txMatch = cb.like(cb.lower(root.get("transactionId")), searchPattern);
                
                predicates.add(cb.or(firstNameMatch, lastNameMatch, emailMatch, planNameMatch, txMatch));
            }

            if (paymentStatus != null) {
                predicates.add(cb.equal(root.get("paymentStatus"), paymentStatus));
            }

            if (subscriptionStatus != null) {
                predicates.add(cb.equal(root.get("subscriptionStatus"), subscriptionStatus));
            }

            if (paymentMethod != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), paymentMethod));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
