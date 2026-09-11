package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.ClassStudent;

@Repository
public interface ClassStudentRepository extends JpaRepository<ClassStudent, Long> {
	List<ClassStudent> findByClassId(Long classId);
	List<ClassStudent> findByStudentId(Long studentId);
	boolean existsByClassIdAndStudentId(Long classId, Long studentId);
	List<ClassStudent> findByClassIdIn(List<Long> classIds);
}
