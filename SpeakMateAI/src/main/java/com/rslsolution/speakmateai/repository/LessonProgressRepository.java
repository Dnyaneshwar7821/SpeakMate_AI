package com.rslsolution.speakmateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Lesson;
import com.rslsolution.speakmateai.entity.LessonProgress;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

	Optional<LessonProgress> findByUserAndLesson(User user, Lesson lesson);

	List<LessonProgress> findByUser(User user);

	List<LessonProgress> findByUserAndCompleted(User user, Boolean completed);

	List<LessonProgress> findByUserOrderByLastOpenedAtDesc(User user);

	boolean existsByUserAndLesson(User user, Lesson lesson);
}
