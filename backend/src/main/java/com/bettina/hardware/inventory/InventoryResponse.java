package com.bettina.hardware.inventory;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class InventoryResponse {
    private Long inventoryId;
    private Long productId;
    private String productName;
    private String description;
    private String sku;
    private String brand;
    private String unit;
    private String shelfLocation;
    private String manufacturerCode;
    private String category;
    private BigDecimal unitPrice;
    private int quantityInStock;
    private int reorderLevel;
    private boolean lowStock;
}
