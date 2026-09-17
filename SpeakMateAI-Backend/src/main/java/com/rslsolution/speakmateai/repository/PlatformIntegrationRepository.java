package com.rslsolution.speakmateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.PlatformIntegration;

@Repository
public interface PlatformIntegrationRepository extends JpaRepository<PlatformIntegration, Long> {

	Optional<PlatformIntegration> findByIntegrationId(String integrationId);

	List<PlatformIntegration> findAllByOrderByCreatedAtAsc();

	boolean existsByIntegrationId(String integrationId);
}
