package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingStatisticsResponse {

    private double totalRevenue;
    private double todaysRevenue;
    private double monthlyRevenue;
    private double yearlyRevenue;

    private long totalPayments;
    private long successfulPayments;
    private long pendingPayments;
    private long failedPayments;
    private long refundedPayments;

    private long totalInvoices;
    private long totalRefunds;
}
