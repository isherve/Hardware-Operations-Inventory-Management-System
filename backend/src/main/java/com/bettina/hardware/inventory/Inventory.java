package com.bettina.hardware.inventory;

import com.bettina.hardware.common.entity.AuditableEntity;
import com.bettina.hardware.product.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Long inventoryId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(name = "quantity_in_stock", nullable = false)
    private int quantityInStock;

    @Column(name = "reorder_level", nullable = false)
    private int reorderLevel;

    public boolean isLowStock() {
        return quantityInStock <= reorderLevel;
    }
}
