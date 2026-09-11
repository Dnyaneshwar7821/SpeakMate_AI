package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.UserSubscription;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long>, JpaSpecificationExecutor<UserSubscription> {

	List<UserSubscription> findByUserOrderByCreatedAtDesc(User user);

	Optional<UserSubscription> findFirstByUserAndStatusOrderByCreatedAtDesc(User user, String status);

	Optional<UserSubscription> findByRazorpayOrderId(String razorpayOrderId);

	Optional<UserSubscription> findByRazorpayPaymentId(String razorpayPaymentId);

	@Query("SELECT COALESCE(SUM(us.amountPaid), 0.0) FROM UserSubscription us")
	Double sumTotalRevenue();

	@Query("SELECT COALESCE(SUM(us.amountPaid), 0.0) FROM UserSubscription us WHERE us.createdAt >= :startDate")
	Double sumRevenueSince(@Param("startDate") LocalDateTime startDate);

	@Query("SELECT COALESCE(SUM(us.amountPaid), 0.0) FROM UserSubscription us WHERE us.createdAt >= :startDate AND us.createdAt < :endDate")
	Double sumRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

	long countBySubscriptionStatus(SubscriptionStatus status);

	Optional<UserSubscription> findFirstByUserIdAndSubscriptionStatus(Long userId, SubscriptionStatus status);
}
