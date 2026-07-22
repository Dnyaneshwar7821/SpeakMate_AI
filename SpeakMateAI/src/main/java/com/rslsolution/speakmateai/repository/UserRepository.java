package com.rslsolution.speakmateai.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	boolean existsByEmail(String email); // Check duplicate email during registration.

	Optional<User> findByEmail(String email); // Used for login and fetching a user by email.

	Optional<User> findByResetPasswordToken(String resetPasswordToken);

	long countByActiveTrue();

}
