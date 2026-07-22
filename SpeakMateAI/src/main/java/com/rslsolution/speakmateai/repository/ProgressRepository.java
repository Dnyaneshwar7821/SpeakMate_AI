package com.rslsolution.speakmateai.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {

	Optional<Progress> findByUser(User user);

	java.util.List<Progress> findByCurrentStreakGreaterThan(int streak);

}