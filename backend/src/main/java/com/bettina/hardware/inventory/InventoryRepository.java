package com.bettina.hardware.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductProductId(Long productId);

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p WHERE i.quantityInStock <= i.reorderLevel ORDER BY p.productName")
    List<Inventory> findLowStock();

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product ORDER BY i.product.productName")
    List<Inventory> findAllWithProduct();
}
