package com.rslsolution.speakmateai.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.SchoolAdminEmailVerification;

@Repository
public interface SchoolAdminEmailVerificationRepository extends JpaRepository<SchoolAdminEmailVerification, Long> {

    Optional<SchoolAdminEmailVerification> findByEmail(String email);

    Optional<SchoolAdminEmailVerification> findByVerificationToken(String verificationToken);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT v FROM SchoolAdminEmailVerification v WHERE v.verificationToken = :verificationToken")
    Optional<SchoolAdminEmailVerification> findByVerificationTokenWithLock(@org.springframework.data.repository.query.Param("verificationToken") String verificationToken);

    boolean existsByEmailAndVerifiedTrue(String email);

    boolean existsByEmail(String email);
}
