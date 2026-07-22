package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.ChatSession;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

	List<ChatSession> findByUserOrderByUpdatedAtDesc(User user);

}
