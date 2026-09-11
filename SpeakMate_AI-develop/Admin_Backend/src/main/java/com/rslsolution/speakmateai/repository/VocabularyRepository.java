package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.Vocabulary;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

	List<Vocabulary> findByStudent(Student student);

	List<Vocabulary> findByStudentOrderByCreatedAtDesc(Student student);

	List<Vocabulary> findByStudentAndFavoriteTrue(Student student);



	@Query("SELECT v FROM Vocabulary v WHERE v.student.id = :#{#user.id}")
	java.util.List<Vocabulary> findByUser(@Param("user") User user);

	@Query("SELECT v FROM Vocabulary v WHERE v.student.id = :#{#user.id} ORDER BY v.createdAt DESC")
	java.util.List<Vocabulary> findByUserOrderByCreatedAtDesc(@Param("user") User user);

}