package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.ChatHistory;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {

	List<ChatHistory> findByUser(User user);

	List<ChatHistory> findByConversationId(String conversationId);

	List<ChatHistory> findByUserOrderByCreatedAtAsc(User user);

	List<ChatHistory> findByConversationIdOrderByCreatedAtAsc(String conversationId);

	void deleteByConversationId(String conversationId);

}