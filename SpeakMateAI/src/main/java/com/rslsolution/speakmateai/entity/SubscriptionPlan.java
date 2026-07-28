package com.rslsolution.speakmateai.entity;

import java.math.BigDecimal;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subscription_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Starter, Professional, Enterprise

    private String description;

    private Integer studentLimit;
    private Integer teacherLimit;
    private Integer aiMinutesLimit;

    private BigDecimal price;
    private String billingCycle; // MONTHLY, YEARLY

    @Column(columnDefinition = "TEXT")
    private String features;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
