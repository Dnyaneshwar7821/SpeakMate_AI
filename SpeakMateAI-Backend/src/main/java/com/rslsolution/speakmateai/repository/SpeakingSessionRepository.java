package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.SpeakingSession;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface SpeakingSessionRepository extends JpaRepository<SpeakingSession, Long> {

	List<SpeakingSession> findByUser(User user);

	List<SpeakingSession> findByUserOrderByCreatedAtDesc(User user);

	default List<SpeakingSession> findByStudent(Student student) {
		return findByUser(student);
	}

	default List<SpeakingSession> findByStudentOrderByCreatedAtDesc(Student student) {
		return findByUserOrderByCreatedAtDesc(student);
	}

	@Query("SELECT AVG(s.overallScore) FROM SpeakingSession s WHERE s.user.id = :userId AND s.overallScore IS NOT NULL")
	Double findAverageOverallScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT AVG(s.pronunciationScore) FROM SpeakingSession s WHERE s.user.id = :userId AND s.pronunciationScore IS NOT NULL")
	Double findAveragePronunciationScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT AVG(s.fluencyScore) FROM SpeakingSession s WHERE s.user.id = :userId AND s.fluencyScore IS NOT NULL")
	Double findAverageFluencyScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT AVG(s.grammarScore) FROM SpeakingSession s WHERE s.user.id = :userId AND s.grammarScore IS NOT NULL")
	Double findAverageGrammarScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT AVG(s.vocabularyScore) FROM SpeakingSession s WHERE s.user.id = :userId AND s.vocabularyScore IS NOT NULL")
	Double findAverageVocabularyScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT s FROM SpeakingSession s WHERE s.user.id = :userId AND s.createdAt BETWEEN :start AND :end ORDER BY s.createdAt DESC")
	List<SpeakingSession> findByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	@Query("SELECT COUNT(s) FROM SpeakingSession s WHERE s.user.id = :userId AND s.createdAt BETWEEN :start AND :end")
	long countByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	@Query("SELECT s FROM SpeakingSession s WHERE s.user.schoolId = :schoolId AND s.createdAt BETWEEN :start AND :end")
	List<SpeakingSession> findSchoolSessionsBetween(@Param("schoolId") Long schoolId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	@Query("SELECT COALESCE(AVG(s.overallScore), 0.0) FROM SpeakingSession s")
	Double getAverageSpeakingScore();
}