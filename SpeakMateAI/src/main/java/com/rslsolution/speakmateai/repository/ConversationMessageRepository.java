package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.ConversationMessage;
import com.rslsolution.speakmateai.entity.SpeakingSession;

@Repository
public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, Long> {

	List<ConversationMessage> findBySessionOrderByTimestampAsc(SpeakingSession session);
}
