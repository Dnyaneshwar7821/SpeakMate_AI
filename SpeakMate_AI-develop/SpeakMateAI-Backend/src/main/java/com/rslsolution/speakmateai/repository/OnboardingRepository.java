package com.rslsolution.speakmateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Onboarding;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface OnboardingRepository extends JpaRepository<Onboarding, Long> {

	List<Onboarding> findByUserOrderByIdDesc(User user);

	default Optional<Onboarding> findByUser(User user) {
		List<Onboarding> list = findByUserOrderByIdDesc(user);
		return (list == null || list.isEmpty()) ? Optional.empty() : Optional.of(list.get(0));
	}

}