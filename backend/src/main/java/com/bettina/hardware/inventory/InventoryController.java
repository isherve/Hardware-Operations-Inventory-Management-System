package com.bettina.hardware.inventory;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public List<InventoryResponse> list() {
        return inventoryService.findAll();
    }

    @GetMapping("/low-stock")
    public List<InventoryResponse> lowStock() {
        return inventoryService.findLowStock();
    }

    @PutMapping("/{productId}")
    public InventoryResponse update(@PathVariable Long productId, @Valid @RequestBody InventoryUpdateRequest request) {
        return inventoryService.update(productId, request);
    }
}
