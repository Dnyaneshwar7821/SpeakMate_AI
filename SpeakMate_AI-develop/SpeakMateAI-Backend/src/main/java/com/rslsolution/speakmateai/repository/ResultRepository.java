package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Result;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long>, JpaSpecificationExecutor<Result> {

	List<Result> findByStudent(User student);

	List<Result> findByStudentAndActiveTrue(User student);

	long countByStudentAndActiveTrue(User student);

	long countByActiveTrue();

	long countByActiveTrueAndStatus(com.rslsolution.speakmateai.enums.Status status);
}
