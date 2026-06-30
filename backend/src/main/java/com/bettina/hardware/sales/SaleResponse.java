package com.bettina.hardware.sales;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class SaleResponse {
    private Long saleId;
    private Long employeeId;
    private String employeeName;
    private Long customerId;
    private String customerName;
    private LocalDate saleDate;
    private BigDecimal totalAmount;
    private boolean refunded;
    private List<SaleLineResponse> lines;
}
