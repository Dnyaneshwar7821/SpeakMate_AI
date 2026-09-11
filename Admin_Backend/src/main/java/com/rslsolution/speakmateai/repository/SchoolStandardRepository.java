package com.rslsolution.speakmateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.SchoolStandard;

@Repository
public interface SchoolStandardRepository extends JpaRepository<SchoolStandard, Long> {
    List<SchoolStandard> findBySchoolId(Long schoolId);
    Optional<SchoolStandard> findBySchoolIdAndStandard(Long schoolId, String standard);
    boolean existsBySchoolIdAndStandard(Long schoolId, String standard);

    @org.springframework.data.jpa.repository.Query("SELECT ss FROM SchoolStandard ss JOIN FETCH ss.school WHERE ss.school.id IN :schoolIds")
    List<SchoolStandard> findBySchoolIdIn(@org.springframework.data.repository.query.Param("schoolIds") List<Long> schoolIds);
}
