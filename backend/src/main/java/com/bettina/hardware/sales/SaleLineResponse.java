package com.bettina.hardware.sales;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SaleLineResponse {
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal unitPriceAtSale;
    private BigDecimal lineTotal;
}
