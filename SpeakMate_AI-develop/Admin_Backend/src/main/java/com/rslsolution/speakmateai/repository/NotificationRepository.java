package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Notification;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

	List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);

	List<Notification> findByRecipientEmailAndIsReadFalse(String recipientEmail);

	long countByRecipientEmailAndIsReadFalse(String recipientEmail);

	List<Notification> findByRecipientEmail(String recipientEmail);

	default List<Notification> findByStudent(Student student) {
		return student != null ? findByRecipientEmail(student.getEmail()) : List.of();
	}

	default List<Notification> findByStudentOrderByCreatedAtDesc(Student student) {
		return student != null ? findByRecipientEmailOrderByCreatedAtDesc(student.getEmail()) : List.of();
	}

	default List<Notification> findByStudentAndIsReadFalse(Student student) {
		return student != null ? findByRecipientEmailAndIsReadFalse(student.getEmail()) : List.of();
	}

	default long countByStudentAndIsReadFalse(Student student) {
		return student != null ? countByRecipientEmailAndIsReadFalse(student.getEmail()) : 0L;
	}
}