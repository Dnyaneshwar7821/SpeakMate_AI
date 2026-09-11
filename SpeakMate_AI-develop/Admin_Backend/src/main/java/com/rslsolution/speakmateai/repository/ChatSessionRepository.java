package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.ChatSession;
import com.rslsolution.speakmateai.entity.Student;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

	List<ChatSession> findByStudentOrderByUpdatedAtDesc(Student student);

}
