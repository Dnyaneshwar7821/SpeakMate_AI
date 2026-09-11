package com.rslsolution.speakmateai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Student;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student> {
	Optional<Student> findByEmail(String email);
	boolean existsByEmail(String email);
	
	List<Student> findBySchoolId(Long schoolId);
	Optional<Student> findByIdAndSchoolId(Long id, Long schoolId);
	List<Student> findByTeacherId(Long teacherId);
}
