package com.rslsolution.speakmateai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.SchoolAdmin;
import java.util.Optional;

@Repository
public interface SchoolAdminRepository extends JpaRepository<SchoolAdmin, Long> {
	Optional<SchoolAdmin> findByEmail(String email);
	boolean existsByEmail(String email);
}
