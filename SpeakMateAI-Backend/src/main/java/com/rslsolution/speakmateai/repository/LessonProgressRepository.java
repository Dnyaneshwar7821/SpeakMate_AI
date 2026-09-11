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

	Optional<LessonProgress> findByUserAndLesson(User user, Lesson lesson);

	default Optional<LessonProgress> findByStudentAndLesson(Student student, Lesson lesson) {
		return findByUserAndLesson(student, lesson);
	}

	List<LessonProgress> findByUser(User user);

	default List<LessonProgress> findByStudent(Student student) {
		return findByUser(student);
	}

	List<LessonProgress> findByUserAndCompleted(User user, Boolean completed);

	default List<LessonProgress> findByStudentAndCompleted(Student student, Boolean completed) {
		return findByUserAndCompleted(student, completed);
	}

	List<LessonProgress> findByUserOrderByLastOpenedAtDesc(User user);

	default List<LessonProgress> findByStudentOrderByLastOpenedAtDesc(Student student) {
		return findByUserOrderByLastOpenedAtDesc(student);
	}

	boolean existsByUserAndLesson(User user, Lesson lesson);

	default boolean existsByStudentAndLesson(Student student, Lesson lesson) {
		return existsByUserAndLesson(student, lesson);
	}

	@Query("SELECT COUNT(l) FROM LessonProgress l WHERE l.user.id = :userId AND l.completed = true")
	long countByUserIdAndCompletedTrue(@Param("userId") Long userId);

	@Query("SELECT COUNT(l) FROM LessonProgress l WHERE l.user.id = :userId AND l.completed = true AND l.updatedAt BETWEEN :start AND :end")
	long countByUserIdAndCompletedAtBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start,
			@Param("end") LocalDateTime end);

	@Query("SELECT COUNT(l) FROM LessonProgress l WHERE l.user.schoolId = :schoolId AND l.completed = true")
	long countByUserSchoolIdAndCompletedTrue(@Param("schoolId") Long schoolId);

	@Query("SELECT l FROM LessonProgress l WHERE l.user.id = :userId AND l.completed = true AND l.updatedAt BETWEEN :start AND :end ORDER BY l.updatedAt DESC")
	List<LessonProgress> findByUserIdAndCompletedAtBetween(@Param("userId") Long userId,
			@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
