package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Lesson;
import com.rslsolution.speakmateai.entity.LessonProgress;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

	Optional<LessonProgress> findByStudentAndLesson(Student student, Lesson lesson);

	List<LessonProgress> findByStudent(Student student);

	List<LessonProgress> findByStudentAndCompleted(Student student, Boolean completed);

	List<LessonProgress> findByStudentOrderByLastOpenedAtDesc(Student student);

	boolean existsByStudentAndLesson(Student student, Lesson lesson);

	@Query("SELECT COUNT(l) FROM LessonProgress l WHERE l.student.id = :userId AND l.completed = true")
	long countByUserIdAndCompletedTrue(@Param("userId") Long userId);

	@Query("SELECT COUNT(l) FROM LessonProgress l WHERE l.student.id = :userId AND l.completed = true AND l.completedAt BETWEEN :start AND :end")
	long countByUserIdAndCompletedAtBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start,
			@Param("end") LocalDateTime end);

	@Query("SELECT COUNT(l) FROM LessonProgress l WHERE l.student.schoolId = :schoolId AND l.completed = true")
	long countByUserSchoolIdAndCompletedTrue(@Param("schoolId") Long schoolId);

	@Query("SELECT l FROM LessonProgress l WHERE l.student.id = :userId AND l.completed = true AND l.completedAt BETWEEN :start AND :end ORDER BY l.completedAt DESC")
	List<LessonProgress> findByUserIdAndCompletedAtBetween(@Param("userId") Long userId,
			@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


	@Query("SELECT l FROM LessonProgress l WHERE l.student = :user")
	java.util.List<LessonProgress> findByUser(@Param("user") User user);

	@Query("SELECT l FROM LessonProgress l WHERE l.student = :user ORDER BY l.lastOpenedAt DESC")
	java.util.List<LessonProgress> findByUserOrderByLastOpenedAtDesc(@Param("user") User user);

}
