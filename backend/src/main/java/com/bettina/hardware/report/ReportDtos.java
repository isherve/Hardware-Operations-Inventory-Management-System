package com.bettina.hardware.report;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReportDtos {

    @Data
    @Builder
    public static class DailyReport {
        private LocalDate date;
        private long saleCount;
        private BigDecimal totalRevenue;
        private List<SaleSummary> sales;
    }

    @Data
    @Builder
    public static class MonthlyReport {
        private int year;
        private int month;
        private long saleCount;
        private BigDecimal totalRevenue;
        private List<SaleSummary> sales;
    }

    @Data
    @Builder
    public static class SaleSummary {
        private Long saleId;
        private LocalDate saleDate;
        private String employeeName;
        private String customerName;
        private BigDecimal totalAmount;
        private boolean refunded;
    }

    @Data
    @Builder
    public static class InventoryReport {
        private int totalProducts;
        private int lowStockCount;
        private BigDecimal totalValuation;
        private List<InventoryItem> items;
        private List<InventoryItem> lowStockItems;
    }

    @Data
    @Builder
    public static class InventoryItem {
        private Long productId;
        private String productName;
        private String category;
        private int quantityInStock;
        private int reorderLevel;
        private BigDecimal unitPrice;
        private BigDecimal valuation;
        private boolean lowStock;
    }

    @Data
    @Builder
    public static class TransactionReport {
        private LocalDate from;
        private LocalDate to;
        private long transactionCount;
        private BigDecimal totalSales;
        private BigDecimal totalRefunds;
        private BigDecimal netTotal;
        private List<TransactionItem> transactions;
    }

    @Data
    @Builder
    public static class TransactionItem {
        private Long transactionId;
        private LocalDate transactionDate;
        private String transactionType;
        private Long saleId;
        private BigDecimal amount;
    }

    @Data
    @Builder
    public static class DashboardReport {
        private BigDecimal salesToday;
        private long salesCountToday;
        private BigDecimal salesThisMonth;
        private long salesCountThisMonth;
        private int lowStockCount;
        private BigDecimal revenueToday;
        private List<TopProduct> topProducts;
    }

    @Data
    @Builder
    public static class TopProduct {
        private Long productId;
        private String productName;
        private long quantitySold;
        private BigDecimal revenue;
    }
}
