package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.rslsolution.speakmateai.entity.User;

import jakarta.persistence.criteria.Predicate;

public class UserSpecification {

    public static Specification<User> filterUsers(String keyword, Boolean status, String englishLevel,
                                                  String nativeLanguage, String purpose,
                                                  LocalDateTime registrationFrom, LocalDateTime registrationTo) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String searchPattern = "%" + keyword.toLowerCase() + "%";
                Predicate firstNameMatch = cb.like(cb.lower(root.get("firstName")), searchPattern);
                Predicate lastNameMatch = cb.like(cb.lower(root.get("lastName")), searchPattern);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), searchPattern);
                predicates.add(cb.or(firstNameMatch, lastNameMatch, emailMatch));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("active"), status));
            }

            if (StringUtils.hasText(englishLevel)) {
                predicates.add(cb.equal(root.get("englishLevel"), englishLevel));
            }

            if (StringUtils.hasText(nativeLanguage)) {
                predicates.add(cb.equal(root.get("nativeLanguage"), nativeLanguage));
            }

            if (StringUtils.hasText(purpose)) {
                predicates.add(cb.equal(root.get("learningGoal"), purpose));
            }

            if (registrationFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), registrationFrom));
            }

            if (registrationTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), registrationTo));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
