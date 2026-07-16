package com.bettina.hardware.inventory;

import com.bettina.hardware.common.exception.ResourceNotFoundException;
import com.bettina.hardware.config.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final SecurityUtils securityUtils;

    public List<InventoryResponse> findAll() {
        return inventoryRepository.findAllWithProduct().stream().map(this::toResponse).toList();
    }

    public List<InventoryResponse> findLowStock() {
        return inventoryRepository.findLowStock().stream().map(this::toResponse).toList();
    }

    @Transactional
    public InventoryResponse update(Long productId, InventoryUpdateRequest request) {
        securityUtils.requireAnyRole("ADMIN", "MANAGER");
        Inventory inventory = inventoryRepository.findByProductProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory for product", productId));
        inventory.setQuantityInStock(request.getQuantityInStock());
        if (request.getReorderLevel() != null) {
            inventory.setReorderLevel(request.getReorderLevel());
        }
        return toResponse(inventoryRepository.save(inventory));
    }

    private InventoryResponse toResponse(Inventory inv) {
        return InventoryResponse.builder()
                .inventoryId(inv.getInventoryId())
                .productId(inv.getProduct().getProductId())
                .productName(inv.getProduct().getProductName())
                .category(inv.getProduct().getCategory())
                .unitPrice(inv.getProduct().getUnitPrice())
                .quantityInStock(inv.getQuantityInStock())
                .reorderLevel(inv.getReorderLevel())
                .lowStock(inv.isLowStock())
                .build();
    }
}
