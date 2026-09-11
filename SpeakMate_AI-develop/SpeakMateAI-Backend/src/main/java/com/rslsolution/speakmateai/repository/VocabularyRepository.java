package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.Vocabulary;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

	List<Vocabulary> findByUser(User user);

	List<Vocabulary> findByUserOrderByCreatedAtDesc(User user);

	List<Vocabulary> findByUserAndFavoriteTrue(User user);

	default List<Vocabulary> findByStudent(Student student) {
		return findByUser(student);
	}

	default List<Vocabulary> findByStudentOrderByCreatedAtDesc(Student student) {
		return findByUserOrderByCreatedAtDesc(student);
	}

	default List<Vocabulary> findByStudentAndFavoriteTrue(Student student) {
		return findByUserAndFavoriteTrue(student);
	}
}