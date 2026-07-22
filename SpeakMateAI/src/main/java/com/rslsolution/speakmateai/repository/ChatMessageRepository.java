package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.ChatMessage;
import com.rslsolution.speakmateai.entity.ChatSession;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

	List<ChatMessage> findBySessionOrderByCreatedAtAsc(ChatSession session);

}
