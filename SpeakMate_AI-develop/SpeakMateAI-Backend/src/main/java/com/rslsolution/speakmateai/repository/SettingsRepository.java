package com.rslsolution.speakmateai.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Settings;
import com.rslsolution.speakmateai.entity.User;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, Long> {

	Optional<Settings> findByUser(User user);

}