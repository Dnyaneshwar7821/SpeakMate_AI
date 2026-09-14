package com.rslsolution.speakmateai.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.School;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    Optional<School> findBySchoolCode(String schoolCode);
    Optional<School> findBySchoolCodeIgnoreCase(String schoolCode);
    Optional<School> findByName(String name);
    Optional<School> findByNameIgnoreCase(String name);
    boolean existsBySchoolCode(String schoolCode);
    boolean existsBySchoolCodeIgnoreCase(String schoolCode);
}
