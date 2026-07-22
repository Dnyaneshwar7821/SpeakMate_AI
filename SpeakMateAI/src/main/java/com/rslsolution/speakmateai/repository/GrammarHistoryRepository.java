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

}