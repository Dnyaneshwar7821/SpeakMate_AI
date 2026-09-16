package com.rslsolution.speakmateai.repository;

import com.rslsolution.speakmateai.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long>, JpaSpecificationExecutor<School> {
    Optional<School> findByName(String name);
    Optional<School> findByNameIgnoreCase(String name);
    Optional<School> findBySchoolCode(String schoolCode);
    Optional<School> findBySchoolCodeIgnoreCase(String schoolCode);
    boolean existsByName(String name);
    boolean existsBySchoolCode(String schoolCode);
}
