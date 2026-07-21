package com.bettina.hardware.inventory;

import com.bettina.hardware.audit.AuditService;
import com.bettina.hardware.common.enums.StockMovementType;
import com.bettina.hardware.common.exception.ResourceNotFoundException;
import com.bettina.hardware.config.SecurityUtils;
import com.bettina.hardware.product.Product;
import com.bettina.hardware.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;

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
        int previous = inventory.getQuantityInStock();
        inventory.setQuantityInStock(request.getQuantityInStock());
        if (request.getReorderLevel() != null) {
            inventory.setReorderLevel(request.getReorderLevel());
        }
        inventoryRepository.save(inventory);

        int delta = request.getQuantityInStock() - previous;
        if (delta != 0) {
            stockMovementRepository.save(StockMovement.builder()
                    .product(inventory.getProduct())
                    .quantity(delta)
                    .movementType(StockMovementType.ADJUSTMENT)
                    .notes("Manual stock adjustment")
                    .performedBy(securityUtils.getCurrentUser().getUsername())
                    .build());
        }

        auditService.log("INVENTORY_ADJUSTED", "Product", productId,
                "Stock " + previous + " -> " + request.getQuantityInStock());
        return toResponse(inventory);
    }

    @Transactional
    public InventoryResponse stockIn(StockInRequest request) {
        securityUtils.requireAnyRole("ADMIN", "MANAGER");
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));
        Inventory inventory = inventoryRepository.findByProductProductId(product.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory for product", product.getProductId()));

        inventory.setQuantityInStock(inventory.getQuantityInStock() + request.getQuantity());
        inventoryRepository.save(inventory);

        stockMovementRepository.save(StockMovement.builder()
                .product(product)
                .quantity(request.getQuantity())
                .movementType(StockMovementType.STOCK_IN)
                .notes(request.getNotes() != null ? request.getNotes() : "Supplier delivery / stock-in")
                .performedBy(securityUtils.getCurrentUser().getUsername())
                .build());

        auditService.log("STOCK_IN", "Product", product.getProductId(),
                "+" + request.getQuantity() + (request.getNotes() != null ? " — " + request.getNotes() : ""));
        return toResponse(inventory);
    }

    private InventoryResponse toResponse(Inventory inv) {
        return InventoryResponse.builder()
                .inventoryId(inv.getInventoryId())
                .productId(inv.getProduct().getProductId())
                .productName(inv.getProduct().getProductName())
                .sku(inv.getProduct().getSku())
                .category(inv.getProduct().getCategory())
                .unitPrice(inv.getProduct().getUnitPrice())
                .quantityInStock(inv.getQuantityInStock())
                .reorderLevel(inv.getReorderLevel())
                .lowStock(inv.isLowStock())
                .build();
    }
}
