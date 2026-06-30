package com.bettina.hardware.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryUpdateRequest {
    @NotNull
    @Min(0)
    private Integer quantityInStock;
    @Min(0)
    private Integer reorderLevel;
}
