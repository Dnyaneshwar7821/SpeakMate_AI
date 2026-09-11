package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.UserSubscription;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long>, JpaSpecificationExecutor<UserSubscription> {

    @Query("SELECT SUM(us.amountPaid) FROM UserSubscription us")
    Double sumTotalRevenue();

    @Query("SELECT SUM(us.amountPaid) FROM UserSubscription us WHERE us.createdAt >= :startDate")
    Double sumRevenueSince(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT SUM(us.amountPaid) FROM UserSubscription us WHERE us.createdAt >= :startDate AND us.createdAt < :endDate")
    Double sumRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    long countBySubscriptionStatus(SubscriptionStatus status);
    
    Optional<UserSubscription> findFirstByUserIdAndSubscriptionStatus(Long userId, SubscriptionStatus status);
}
