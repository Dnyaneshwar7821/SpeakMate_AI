package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.SpeakingSession;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface SpeakingSessionRepository extends JpaRepository<SpeakingSession, Long> {

	List<SpeakingSession> findByUser(User user);

	List<SpeakingSession> findByUserOrderByCreatedAtDesc(User user);

}