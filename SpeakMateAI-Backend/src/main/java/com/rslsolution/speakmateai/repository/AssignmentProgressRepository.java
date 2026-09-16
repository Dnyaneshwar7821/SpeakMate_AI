package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.AssignmentProgress;

@Repository
public interface AssignmentProgressRepository extends JpaRepository<AssignmentProgress, Long> {
    List<AssignmentProgress> findByStudentId(Long studentId);
}
