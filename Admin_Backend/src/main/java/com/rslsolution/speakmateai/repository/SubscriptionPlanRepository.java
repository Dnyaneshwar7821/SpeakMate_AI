package com.rslsolution.speakmateai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.SubscriptionPlan;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long>, JpaSpecificationExecutor<SubscriptionPlan> {

    boolean existsByPlanNameIgnoreCase(String planName);

    long countByIsActiveTrue();

    long countByIsActiveFalse();
}
