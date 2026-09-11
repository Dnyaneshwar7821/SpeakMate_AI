package com.rslsolution.speakmateai.repository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.dto.request.StandardDivisionPair;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class StudentSpecification {

    public static Specification<Student> filterStudents(Long schoolId, Long teacherId, List<StandardDivisionPair> teacherDivisions, String standard, String name) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (schoolId != null) {
                predicates.add(cb.equal(root.get("schoolId"), schoolId));
            }

            if (teacherId != null) {
                Predicate directAssignment = cb.equal(root.get("teacherId"), teacherId);
                
                if (teacherDivisions != null && !teacherDivisions.isEmpty()) {
                    List<Predicate> divisionPredicates = new ArrayList<>();
                    for (StandardDivisionPair pair : teacherDivisions) {
                        Predicate stdMatch = pair.getStandard() != null ? cb.equal(root.get("standard"), pair.getStandard()) : cb.isNull(root.get("standard"));
                        Predicate divMatch = pair.getDivision() != null ? cb.equal(root.get("division"), pair.getDivision()) : cb.isNull(root.get("division"));
                        divisionPredicates.add(cb.and(stdMatch, divMatch));
                    }
                    Predicate classAssignment = cb.or(divisionPredicates.toArray(new Predicate[0]));
                    predicates.add(cb.or(directAssignment, classAssignment));
                } else {
                    predicates.add(directAssignment);
                }
            }

            if (StringUtils.hasText(standard) && !"all".equalsIgnoreCase(standard) && !"All Standards".equalsIgnoreCase(standard)) {
                predicates.add(cb.equal(root.get("standard"), standard));
            }

            if (StringUtils.hasText(name)) {
                String searchPattern = "%" + name.toLowerCase() + "%";
                Predicate firstNameMatch = cb.like(cb.lower(root.get("firstName")), searchPattern);
                Predicate lastNameMatch = cb.like(cb.lower(root.get("lastName")), searchPattern);
                
                Predicate concatMatch = cb.like(
                    cb.lower(cb.concat(cb.concat(root.get("firstName"), " "), root.get("lastName"))),
                    searchPattern
                );
                
                predicates.add(cb.or(firstNameMatch, lastNameMatch, concatMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
