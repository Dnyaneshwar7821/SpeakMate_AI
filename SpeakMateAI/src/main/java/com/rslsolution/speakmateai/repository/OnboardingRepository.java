package com.rslsolution.speakmateai.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Onboarding;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface OnboardingRepository extends JpaRepository<Onboarding, Long> {

	Optional<Onboarding> findByUser(User user);

}