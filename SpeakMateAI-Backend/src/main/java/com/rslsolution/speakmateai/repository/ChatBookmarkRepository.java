package com.rslsolution.speakmateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.ChatBookmark;
import com.rslsolution.speakmateai.entity.ChatMessage;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface ChatBookmarkRepository extends JpaRepository<ChatBookmark, Long> {

	List<ChatBookmark> findByUserOrderByCreatedAtDesc(User user);

	Optional<ChatBookmark> findByUserAndMessage(User user, ChatMessage message);

	boolean existsByUserAndMessage(User user, ChatMessage message);

}
