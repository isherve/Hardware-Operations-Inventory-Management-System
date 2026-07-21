-- Free professional features: SKU, payment method, soft-delete, stock movements, audit log

ALTER TABLE product ADD COLUMN sku VARCHAR(50);

UPDATE product SET sku = 'BH-' || LPAD(CAST(product_id AS VARCHAR), 4, '0') WHERE sku IS NULL;

CREATE INDEX idx_product_sku ON product(sku);

ALTER TABLE sales ADD COLUMN payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH';

ALTER TABLE customer ADD COLUMN deleted_at TIMESTAMP;

CREATE TABLE stock_movement (
    movement_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(product_id),
    quantity INT NOT NULL,
    movement_type VARCHAR(20) NOT NULL,
    notes VARCHAR(500),
    performed_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_stock_movement_type CHECK (movement_type IN ('STOCK_IN', 'ADJUSTMENT', 'SALE', 'REFUND'))
);

CREATE INDEX idx_stock_movement_product ON stock_movement(product_id);
CREATE INDEX idx_stock_movement_created ON stock_movement(created_at);

CREATE TABLE audit_log (
    audit_id BIGSERIAL PRIMARY KEY,
    actor_username VARCHAR(100),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_created ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);
