package com.bettina.hardware.sales;

import com.bettina.hardware.common.entity.AuditableEntity;
import com.bettina.hardware.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "sale_product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleProduct extends AuditableEntity {

    @EmbeddedId
    private SaleProductId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("saleId")
    @JoinColumn(name = "sale_id")
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "unit_price_at_sale", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceAtSale;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class SaleProductId implements Serializable {
        @Column(name = "sale_id")
        private Long saleId;
        @Column(name = "product_id")
        private Long productId;
    }
}
