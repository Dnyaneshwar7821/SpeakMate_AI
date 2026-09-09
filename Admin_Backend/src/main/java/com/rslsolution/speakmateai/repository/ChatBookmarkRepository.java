package com.rslsolution.speakmateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.ChatBookmark;
import com.rslsolution.speakmateai.entity.ChatMessage;
import com.rslsolution.speakmateai.entity.Student;

@Repository
public interface ChatBookmarkRepository extends JpaRepository<ChatBookmark, Long> {

	List<ChatBookmark> findByStudentOrderByCreatedAtDesc(Student student);

	Optional<ChatBookmark> findByStudentAndMessage(Student student, ChatMessage message);

	boolean existsByStudentAndMessage(Student student, ChatMessage message);

}
