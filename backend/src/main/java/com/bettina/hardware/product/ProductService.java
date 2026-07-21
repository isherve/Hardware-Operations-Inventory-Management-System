package com.bettina.hardware.product;

import com.bettina.hardware.audit.AuditService;
import com.bettina.hardware.common.exception.BusinessException;
import com.bettina.hardware.common.exception.ResourceNotFoundException;
import com.bettina.hardware.inventory.Inventory;
import com.bettina.hardware.inventory.InventoryRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final AuditService auditService;

    public List<ProductResponse> findAll(String search, String category) {
        return productRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("productName")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(root.get("sku")), pattern)
                ));
            }
            if (StringUtils.hasText(category)) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        }).stream().map(this::toResponse).toList();
    }

    public ProductResponse findById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return toResponse(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        String sku = normalizeSku(request.getSku());
        ensureSkuUnique(sku, null);

        Product product = Product.builder()
                .productName(request.getProductName())
                .description(request.getDescription())
                .category(request.getCategory())
                .unitPrice(request.getUnitPrice())
                .sku(sku)
                .build();
        product = productRepository.save(product);

        int stock = request.getInitialStock() != null ? request.getInitialStock() : 0;
        int reorder = request.getReorderLevel() != null ? request.getReorderLevel() : 10;
        Inventory inventory = Inventory.builder()
                .product(product)
                .quantityInStock(stock)
                .reorderLevel(reorder)
                .build();
        inventoryRepository.save(inventory);
        product.setInventory(inventory);

        auditService.log("PRODUCT_CREATED", "Product", product.getProductId(), product.getProductName());
        return toResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        String sku = normalizeSku(request.getSku());
        ensureSkuUnique(sku, id);

        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setUnitPrice(request.getUnitPrice());
        product.setSku(sku);
        productRepository.save(product);
        auditService.log("PRODUCT_UPDATED", "Product", id, product.getProductName());
        return toResponse(product);
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", id);
        }
        productRepository.deleteById(id);
        auditService.log("PRODUCT_DELETED", "Product", id, null);
    }

    private String normalizeSku(String sku) {
        if (!StringUtils.hasText(sku)) {
            return null;
        }
        return sku.trim().toUpperCase();
    }

    private void ensureSkuUnique(String sku, Long excludeId) {
        if (sku == null) {
            return;
        }
        productRepository.findAll().stream()
                .filter(p -> sku.equalsIgnoreCase(p.getSku()))
                .filter(p -> excludeId == null || !p.getProductId().equals(excludeId))
                .findFirst()
                .ifPresent(p -> {
                    throw new BusinessException("SKU already in use: " + sku);
                });
    }

    private ProductResponse toResponse(Product product) {
        Inventory inv = inventoryRepository.findByProductProductId(product.getProductId()).orElse(null);
        return ProductResponse.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .category(product.getCategory())
                .sku(product.getSku())
                .unitPrice(product.getUnitPrice())
                .quantityInStock(inv != null ? inv.getQuantityInStock() : null)
                .reorderLevel(inv != null ? inv.getReorderLevel() : null)
                .lowStock(inv != null && inv.isLowStock())
                .build();
    }
}
