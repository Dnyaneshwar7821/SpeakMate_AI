package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.GrammarHistory;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface GrammarHistoryRepository extends JpaRepository<GrammarHistory, Long> {

	List<GrammarHistory> findByUser(User user);

	List<GrammarHistory> findByUserOrderByCreatedAtDesc(User user);

	@org.springframework.data.jpa.repository.Query("SELECT AVG(g.grammarScore) FROM GrammarHistory g WHERE g.user.id = :userId AND g.grammarScore IS NOT NULL")
	Double findAverageGrammarScoreByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

	@org.springframework.data.jpa.repository.Query("SELECT g.user.id, AVG(g.grammarScore) FROM GrammarHistory g WHERE g.user.id IN :userIds AND g.grammarScore IS NOT NULL GROUP BY g.user.id")
	List<Object[]> findAverageGrammarScoreByUserIds(@org.springframework.data.repository.query.Param("userIds") java.util.Collection<Long> userIds);

	@org.springframework.data.jpa.repository.Query("SELECT g FROM GrammarHistory g WHERE g.user.id IN :userIds AND g.createdAt BETWEEN :start AND :end ORDER BY g.createdAt DESC")
	List<GrammarHistory> findByUserIdsAndCreatedAtBetween(@org.springframework.data.repository.query.Param("userIds") java.util.Collection<Long> userIds,
			@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
			@org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

	@org.springframework.data.jpa.repository.Query("SELECT COUNT(g) FROM GrammarHistory g WHERE g.user.id = :userId AND g.createdAt BETWEEN :start AND :end")
	long countByUserIdAndCreatedAtBetween(@org.springframework.data.repository.query.Param("userId") Long userId,
			@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
			@org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

	@org.springframework.data.jpa.repository.Query("SELECT g FROM GrammarHistory g WHERE g.user.id = :userId AND g.createdAt BETWEEN :start AND :end ORDER BY g.createdAt DESC")
	List<GrammarHistory> findByUserIdAndCreatedAtBetween(@org.springframework.data.repository.query.Param("userId") Long userId,
			@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
			@org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);
	@org.springframework.data.jpa.repository.Modifying
	@org.springframework.transaction.annotation.Transactional
	@org.springframework.data.jpa.repository.Query("DELETE FROM GrammarHistory g WHERE g.user = :user")
	void deleteByUser(@org.springframework.data.repository.query.Param("user") User user);
}