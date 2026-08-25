package com.rslsolution.speakmateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.UserSubscription;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

	List<UserSubscription> findByUserOrderByCreatedAtDesc(User user);

	Optional<UserSubscription> findFirstByUserAndStatusOrderByCreatedAtDesc(User user, String status);

	Optional<UserSubscription> findByRazorpayOrderId(String razorpayOrderId);

	Optional<UserSubscription> findByRazorpayPaymentId(String razorpayPaymentId);
}
