package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Lesson;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

	List<Lesson> findByCategory(String category);

	List<Lesson> findByLevel(String level);

	List<Lesson> findByCategoryAndLevel(String category, String level);

	List<Lesson> findByActiveTrue();

	List<Lesson> findByActiveTrueAndPopularTrue();

	List<Lesson> findByActiveTrueAndFeaturedTrue();

	@Query("SELECT l FROM Lesson l WHERE l.active = true AND (LOWER(l.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(l.description) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(l.category) LIKE LOWER(CONCAT('%', :q, '%')))")
	List<Lesson> searchActive(@Param("q") String query);
}