package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Achievement;
import com.rslsolution.speakmateai.entity.Student;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {

	List<Achievement> findByStudent(Student student);

	List<Achievement> findByStudentOrderByCreatedAtDesc(Student student);

	List<Achievement> findByStudentAndUnlockedTrue(Student student);

	@Query("SELECT COUNT(a) FROM Achievement a WHERE a.student.id = :userId AND a.unlocked = true")
	long countByUserIdAndUnlockedTrue(@Param("userId") Long userId);

	@Query("SELECT a FROM Achievement a WHERE a.student.id = :userId AND a.unlocked = true ORDER BY a.unlockedAt DESC")
	List<Achievement> findByUserIdAndUnlockedTrueOrderByUnlockedAtDesc(@Param("userId") Long userId);
}