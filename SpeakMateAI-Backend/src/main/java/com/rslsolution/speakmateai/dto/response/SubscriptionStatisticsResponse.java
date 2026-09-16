package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionStatisticsResponse {

    private long totalSubscriptionPlans;
    private long activePlans;
    private long inactivePlans;

    private long totalSubscribers;
    private long activeSubscribers;
    private long expiredSubscriptions;
    private long cancelledSubscriptions;

    private long totalUsers;
    private long freeUsers;
    private long activeProSubscribers;
    private long monthlyProSubscribers;
    private long annualProSubscribers;
    private double conversionRate;

    // Distribution
    private long freeStarterCount;
    private long monthlyProCount;
    private long annualProCount;

    // Actual Payment records
    private long totalPayments;
    private long successfulPayments;

    private double totalRevenue;
    private double monthlyRevenue;
    private double todaysRevenue;
}
