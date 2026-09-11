package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.GrammarHistory;
import com.rslsolution.speakmateai.entity.Student;

@Repository
public interface GrammarHistoryRepository extends JpaRepository<GrammarHistory, Long> {

	List<GrammarHistory> findByStudent(Student student);

	List<GrammarHistory> findByStudentOrderByCreatedAtDesc(Student student);

	@Query("SELECT AVG(g.grammarScore) FROM GrammarHistory g WHERE g.student.id = :userId AND g.grammarScore IS NOT NULL")
	Double findAverageGrammarScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT COUNT(g) FROM GrammarHistory g WHERE g.student.id = :userId AND g.createdAt BETWEEN :start AND :end")
	long countByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	@Query("SELECT g FROM GrammarHistory g WHERE g.student.id = :userId AND g.createdAt BETWEEN :start AND :end ORDER BY g.createdAt DESC")
	List<GrammarHistory> findByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}