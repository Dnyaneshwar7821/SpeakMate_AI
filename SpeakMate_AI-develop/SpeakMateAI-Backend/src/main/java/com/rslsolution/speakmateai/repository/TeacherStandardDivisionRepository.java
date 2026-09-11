package com.rslsolution.speakmateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.TeacherStandardDivision;

@Repository
public interface TeacherStandardDivisionRepository extends JpaRepository<TeacherStandardDivision, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT tsd FROM TeacherStandardDivision tsd LEFT JOIN FETCH tsd.standardDivision sd LEFT JOIN FETCH sd.schoolStandard ss LEFT JOIN FETCH ss.school WHERE tsd.teacher.id = :teacherId")
    List<TeacherStandardDivision> findByTeacherId(@org.springframework.data.repository.query.Param("teacherId") Long teacherId);
    Optional<TeacherStandardDivision> findByTeacherIdAndStandardDivisionId(Long teacherId, Long standardDivisionId);
    void deleteByTeacherId(Long teacherId);
    boolean existsByStandardDivisionId(Long standardDivisionId);
    boolean existsByStandardDivision_SchoolStandard_Id(Long schoolStandardId);
    Optional<TeacherStandardDivision> findFirstByStandardDivisionId(Long standardDivisionId);
    Optional<TeacherStandardDivision> findFirstByStandardDivisionIdAndTeacherIdNot(Long standardDivisionId, Long teacherId);

    @org.springframework.data.jpa.repository.Query("SELECT tsd FROM TeacherStandardDivision tsd JOIN FETCH tsd.standardDivision sd JOIN FETCH sd.schoolStandard ss LEFT JOIN FETCH ss.school WHERE tsd.teacher.id IN :teacherIds")
    List<TeacherStandardDivision> findByTeacherIdIn(@org.springframework.data.repository.query.Param("teacherIds") List<Long> teacherIds);
}
