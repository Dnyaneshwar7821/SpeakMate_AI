package com.rslsolution.speakmateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;

import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {

	Optional<Progress> findByUser(User user);

	@Query("SELECT p FROM Progress p WHERE p.user.id = :userId")
	Optional<Progress> findByUserId(@Param("userId") Long userId);

	List<Progress> findByUserIn(java.util.Collection<User> users);

	default Optional<Progress> findByStudent(Student student) {
		if (student == null) return Optional.empty();
		return findByUserId(student.getId()).or(() -> findByUser(student));
	}

	List<Progress> findByCurrentStreakGreaterThan(int streak);

	long countByCurrentStreakGreaterThan(int streak);

	List<Progress> findTop50ByOrderByXpDesc();

	List<Progress> findAllByOrderByXpDesc();

	@Query("SELECT COALESCE(AVG(p.totalPracticeMinutes), 0.0) FROM Progress p")
	Double getAveragePracticeMinutes();
}