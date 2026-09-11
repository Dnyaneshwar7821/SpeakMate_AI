package com.rslsolution.speakmateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.StandardDivision;

@Repository
public interface StandardDivisionRepository extends JpaRepository<StandardDivision, Long> {
    List<StandardDivision> findBySchoolStandardId(Long schoolStandardId);
    Optional<StandardDivision> findBySchoolStandardIdAndDivision(Long schoolStandardId, String division);
    boolean existsBySchoolStandardIdAndDivision(Long schoolStandardId, String division);

    @org.springframework.data.jpa.repository.Query("SELECT sd FROM StandardDivision sd JOIN FETCH sd.schoolStandard WHERE sd.schoolStandard.id IN :schoolStandardIds")
    List<StandardDivision> findBySchoolStandardIdIn(@org.springframework.data.repository.query.Param("schoolStandardIds") List<Long> schoolStandardIds);
}
