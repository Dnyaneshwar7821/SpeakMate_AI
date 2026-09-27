package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Achievement;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {

	List<Achievement> findByUser(User user);

	List<Achievement> findByUserOrderByCreatedAtDesc(User user);

	List<Achievement> findByUserAndUnlockedTrue(User user);

	@org.springframework.data.jpa.repository.Query("SELECT a FROM Achievement a WHERE a.user.id = :userId")
	List<Achievement> findByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

	@org.springframework.data.jpa.repository.Query("SELECT a FROM Achievement a WHERE a.user.id = :userId AND a.unlocked = true")
	List<Achievement> findByUserIdAndUnlockedTrue(@org.springframework.data.repository.query.Param("userId") Long userId);

	List<Achievement> findByUserIdAndUnlockedTrueOrderByUnlockedAtDesc(Long userId);
}