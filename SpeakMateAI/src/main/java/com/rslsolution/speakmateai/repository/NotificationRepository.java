package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Notification;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

	List<Notification> findByUser(User user);

	List<Notification> findByUserOrderByCreatedAtDesc(User user);

	List<Notification> findByUserAndIsReadFalse(User user);

	long countByUserAndIsReadFalse(User user);

	@Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.user = :user AND n.title LIKE CONCAT(:titlePrefix, '%') AND n.createdAt >= :after")
	boolean existsByUserAndTitleStartingWithAndCreatedAtAfter(@Param("user") User user, @Param("titlePrefix") String titlePrefix, @Param("after") LocalDateTime after);

	@Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.user = :user AND n.title LIKE '%Streak%' AND n.title LIKE '%Risk%' AND n.createdAt >= :after")
	boolean existsStreakWarningToday(@Param("user") User user, @Param("after") LocalDateTime after);

}