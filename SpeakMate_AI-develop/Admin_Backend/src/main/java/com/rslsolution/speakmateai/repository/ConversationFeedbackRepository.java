package com.rslsolution.speakmateai.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.ConversationFeedback;
import com.rslsolution.speakmateai.entity.SpeakingSession;

@Repository
public interface ConversationFeedbackRepository extends JpaRepository<ConversationFeedback, Long> {

	Optional<ConversationFeedback> findBySession(SpeakingSession session);
}
