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

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public double getTodaysRevenue() { return todaysRevenue; }
    public void setTodaysRevenue(double todaysRevenue) { this.todaysRevenue = todaysRevenue; }

    public double getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(double monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }

    public double getYearlyRevenue() { return yearlyRevenue; }
    public void setYearlyRevenue(double yearlyRevenue) { this.yearlyRevenue = yearlyRevenue; }

    public long getTotalPayments() { return totalPayments; }
    public void setTotalPayments(long totalPayments) { this.totalPayments = totalPayments; }

    public long getSuccessfulPayments() { return successfulPayments; }
    public void setSuccessfulPayments(long successfulPayments) { this.successfulPayments = successfulPayments; }

    public long getPendingPayments() { return pendingPayments; }
    public void setPendingPayments(long pendingPayments) { this.pendingPayments = pendingPayments; }

    public long getFailedPayments() { return failedPayments; }
    public void setFailedPayments(long failedPayments) { this.failedPayments = failedPayments; }

    public long getRefundedPayments() { return refundedPayments; }
    public void setRefundedPayments(long refundedPayments) { this.refundedPayments = refundedPayments; }

    public long getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(long totalInvoices) { this.totalInvoices = totalInvoices; }

    public long getTotalRefunds() { return totalRefunds; }
    public void setTotalRefunds(long totalRefunds) { this.totalRefunds = totalRefunds; }

    public static BillingStatisticsResponseBuilder builder() {
        return new BillingStatisticsResponseBuilder();
    }

    public static class BillingStatisticsResponseBuilder {
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

        public BillingStatisticsResponseBuilder totalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; return this; }
        public BillingStatisticsResponseBuilder todaysRevenue(double todaysRevenue) { this.todaysRevenue = todaysRevenue; return this; }
        public BillingStatisticsResponseBuilder monthlyRevenue(double monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; return this; }
        public BillingStatisticsResponseBuilder yearlyRevenue(double yearlyRevenue) { this.yearlyRevenue = yearlyRevenue; return this; }
        public BillingStatisticsResponseBuilder totalPayments(long totalPayments) { this.totalPayments = totalPayments; return this; }
        public BillingStatisticsResponseBuilder successfulPayments(long successfulPayments) { this.successfulPayments = successfulPayments; return this; }
        public BillingStatisticsResponseBuilder pendingPayments(long pendingPayments) { this.pendingPayments = pendingPayments; return this; }
        public BillingStatisticsResponseBuilder failedPayments(long failedPayments) { this.failedPayments = failedPayments; return this; }
        public BillingStatisticsResponseBuilder refundedPayments(long refundedPayments) { this.refundedPayments = refundedPayments; return this; }
        public BillingStatisticsResponseBuilder totalInvoices(long totalInvoices) { this.totalInvoices = totalInvoices; return this; }
        public BillingStatisticsResponseBuilder totalRefunds(long totalRefunds) { this.totalRefunds = totalRefunds; return this; }

        public BillingStatisticsResponse build() {
            BillingStatisticsResponse r = new BillingStatisticsResponse();
            r.totalRevenue = totalRevenue;
            r.todaysRevenue = todaysRevenue;
            r.monthlyRevenue = monthlyRevenue;
            r.yearlyRevenue = yearlyRevenue;
            r.totalPayments = totalPayments;
            r.successfulPayments = successfulPayments;
            r.pendingPayments = pendingPayments;
            r.failedPayments = failedPayments;
            r.refundedPayments = refundedPayments;
            r.totalInvoices = totalInvoices;
            r.totalRefunds = totalRefunds;
            return r;
        }
    }
}
