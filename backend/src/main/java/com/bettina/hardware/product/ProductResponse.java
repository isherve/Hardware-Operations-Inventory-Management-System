package com.bettina.hardware.product;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductResponse {
    private Long productId;
    private String productName;
    private String description;
    private String category;
    private String sku;
    private BigDecimal unitPrice;
    private Integer quantityInStock;
    private Integer reorderLevel;
    private boolean lowStock;
}
