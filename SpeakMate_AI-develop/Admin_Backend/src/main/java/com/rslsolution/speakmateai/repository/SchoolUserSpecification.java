package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.UserType;

import jakarta.persistence.criteria.Predicate;

public class SchoolUserSpecification {

    public static Specification<Student> filterSchoolUsers(String keyword, String standard, String division, String schoolName, 
                                                        Boolean status, LocalDateTime registrationFrom, LocalDateTime registrationTo) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always enforce School User identity (school-enrolled student)
            Predicate isSchoolStudent = cb.or(
                cb.equal(root.get("userType"), UserType.SCHOOL),
                cb.equal(root.get("role"), Role.STUDENT),
                cb.isNotNull(root.get("schoolId"))
            );
            predicates.add(isSchoolStudent);

            if (StringUtils.hasText(keyword)) {
                String searchPattern = "%" + keyword.toLowerCase() + "%";
                Predicate firstNameMatch = cb.like(cb.lower(root.get("firstName")), searchPattern);
                Predicate lastNameMatch = cb.like(cb.lower(root.get("lastName")), searchPattern);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), searchPattern);
                Predicate schoolMatch = cb.like(cb.lower(root.get("schoolName")), searchPattern);
                Predicate parentMatch = cb.like(cb.lower(root.get("parentName")), searchPattern);
                Predicate rollMatch = cb.like(cb.lower(root.get("rollNumber")), searchPattern);
                predicates.add(cb.or(firstNameMatch, lastNameMatch, emailMatch, schoolMatch, parentMatch, rollMatch));
            }

            if (StringUtils.hasText(standard)) {
                predicates.add(cb.equal(root.get("standard"), standard));
            }

            if (StringUtils.hasText(division)) {
                predicates.add(cb.equal(root.get("division"), division));
            }

            if (StringUtils.hasText(schoolName)) {
                predicates.add(cb.like(cb.lower(root.get("schoolName")), "%" + schoolName.toLowerCase() + "%"));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("active"), status));
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
