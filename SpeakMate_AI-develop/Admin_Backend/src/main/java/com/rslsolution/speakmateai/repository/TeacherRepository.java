package com.rslsolution.speakmateai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Teacher;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
	Optional<Teacher> findByEmail(String email);
	boolean existsByEmail(String email);
	List<Teacher> findBySchoolId(Long schoolId);
}
