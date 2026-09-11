package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.rslsolution.speakmateai.entity.Payment;
import com.rslsolution.speakmateai.enums.PaymentGateway;
import com.rslsolution.speakmateai.enums.PaymentMethod;
import com.rslsolution.speakmateai.enums.PaymentStatus;

import jakarta.persistence.criteria.Predicate;

public class BillingSpecification {

    public static Specification<Payment> filterPayments(
            String search,
            PaymentStatus paymentStatus,
            PaymentMethod paymentMethod,
            PaymentGateway paymentGateway,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Double minAmount,
            Double maxAmount) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate userFirstName = criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("firstName")), searchPattern);
                Predicate userLastName = criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("lastName")), searchPattern);
                Predicate userEmail = criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("email")), searchPattern);
                Predicate transactionId = criteriaBuilder.like(criteriaBuilder.lower(root.get("transactionId")), searchPattern);
                
                predicates.add(criteriaBuilder.or(userFirstName, userLastName, userEmail, transactionId));
            }

            if (paymentStatus != null) {
                predicates.add(criteriaBuilder.equal(root.get("paymentStatus"), paymentStatus));
            }

            if (paymentMethod != null) {
                predicates.add(criteriaBuilder.equal(root.get("paymentMethod"), paymentMethod));
            }

            if (paymentGateway != null) {
                predicates.add(criteriaBuilder.equal(root.get("paymentGateway"), paymentGateway));
            }

            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("paymentDate"), startDate));
            }

            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("paymentDate"), endDate));
            }

            if (minAmount != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("amount"), minAmount));
            }

            if (maxAmount != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("amount"), maxAmount));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
