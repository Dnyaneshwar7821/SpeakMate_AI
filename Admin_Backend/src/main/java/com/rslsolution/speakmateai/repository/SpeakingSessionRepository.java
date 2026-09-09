package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rslsolution.speakmateai.entity.SpeakingSession;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface SpeakingSessionRepository extends JpaRepository<SpeakingSession, Long> {

	List<SpeakingSession> findByStudent(Student student);

	List<SpeakingSession> findByStudentOrderByCreatedAtDesc(Student student);

	@Query("SELECT AVG(s.overallScore) FROM SpeakingSession s WHERE s.student.id = :userId AND s.overallScore IS NOT NULL")
	Double findAverageOverallScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT AVG(s.pronunciationScore) FROM SpeakingSession s WHERE s.student.id = :userId AND s.pronunciationScore IS NOT NULL")
	Double findAveragePronunciationScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT AVG(s.fluencyScore) FROM SpeakingSession s WHERE s.student.id = :userId AND s.fluencyScore IS NOT NULL")
	Double findAverageFluencyScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT AVG(s.grammarScore) FROM SpeakingSession s WHERE s.student.id = :userId AND s.grammarScore IS NOT NULL")
	Double findAverageGrammarScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT AVG(s.vocabularyScore) FROM SpeakingSession s WHERE s.student.id = :userId AND s.vocabularyScore IS NOT NULL")
	Double findAverageVocabularyScoreByUserId(@Param("userId") Long userId);



	@Query("SELECT s FROM SpeakingSession s WHERE s.student = :user ORDER BY s.createdAt DESC")
	java.util.List<SpeakingSession> findByUserOrderByCreatedAtDesc(@Param("user") User user);

	@Query("SELECT s FROM SpeakingSession s WHERE s.student.id = :userId AND s.createdAt BETWEEN :start AND :end ORDER BY s.createdAt DESC")
	java.util.List<SpeakingSession> findByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

	@Query("SELECT COUNT(s) FROM SpeakingSession s WHERE s.student.id = :userId AND s.createdAt BETWEEN :start AND :end")
	long countByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

	@Query("SELECT s FROM SpeakingSession s WHERE s.student.schoolId = :schoolId AND s.createdAt BETWEEN :start AND :end")
	java.util.List<SpeakingSession> findSchoolSessionsBetween(@Param("schoolId") Long schoolId, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

	@Query("SELECT COALESCE(AVG(s.overallScore), 0.0) FROM SpeakingSession s")
	Double getAverageSpeakingScore();
}
