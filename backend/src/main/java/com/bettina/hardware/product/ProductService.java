package com.bettina.hardware.product;

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

    public List<ProductResponse> findAll(String search, String category) {
        return productRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("productName")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
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
        Product product = Product.builder()
                .productName(request.getProductName())
                .description(request.getDescription())
                .category(request.getCategory())
                .unitPrice(request.getUnitPrice())
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
        return toResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setUnitPrice(request.getUnitPrice());
        productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", id);
        }
        productRepository.deleteById(id);
    }

    private ProductResponse toResponse(Product product) {
        Inventory inv = inventoryRepository.findByProductProductId(product.getProductId()).orElse(null);
        return ProductResponse.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .category(product.getCategory())
                .unitPrice(product.getUnitPrice())
                .quantityInStock(inv != null ? inv.getQuantityInStock() : null)
                .reorderLevel(inv != null ? inv.getReorderLevel() : null)
                .lowStock(inv != null && inv.isLowStock())
                .build();
    }
}
