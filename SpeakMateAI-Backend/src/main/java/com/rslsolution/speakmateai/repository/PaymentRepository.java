package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.Payment;
import com.rslsolution.speakmateai.enums.PaymentStatus;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'PAID'")
    Double sumTotalRevenue();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'PAID' AND p.paymentDate >= :startDate")
    Double sumRevenueSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'PAID' AND p.paymentDate >= :startDate AND p.paymentDate < :endDate")
    Double sumRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    long countByPaymentStatus(PaymentStatus paymentStatus);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.paymentStatus = 'PAID' AND p.user.schoolId = :schoolId")
    Double sumTotalRevenueForSchool(@Param("schoolId") Long schoolId);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.paymentStatus = 'PAID' AND p.paymentDate >= :startDate AND p.user.schoolId = :schoolId")
    Double sumRevenueSinceForSchool(@Param("startDate") LocalDateTime startDate, @Param("schoolId") Long schoolId);

    long countByPaymentStatusAndUserSchoolId(PaymentStatus paymentStatus, Long schoolId);
}
