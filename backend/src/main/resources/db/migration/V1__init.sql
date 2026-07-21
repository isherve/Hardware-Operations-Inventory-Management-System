-- Built In Hardware - Initial Schema
-- V1: Create all tables per domain model

CREATE TABLE app_admin (
    admin_id BIGSERIAL PRIMARY KEY,
    admin_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer (
    customer_id BIGSERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    loyalty_points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employee (
    employee_id BIGSERIAL PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_employee_role CHECK (role IN ('CASHIER', 'MANAGER', 'SALES_ASSISTANT', 'DRIVER')),
    CONSTRAINT chk_employee_status CHECK (status IN ('ACTIVE', 'TERMINATED'))
);

CREATE TABLE product (
    product_id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
    inventory_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE REFERENCES product(product_id) ON DELETE CASCADE,
    quantity_in_stock INT NOT NULL,
    reorder_level INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_quantity_non_negative CHECK (quantity_in_stock >= 0)
);

CREATE TABLE sales (
    sale_id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(employee_id),
    customer_id BIGINT REFERENCES customer(customer_id),
    sale_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    refunded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_product (
    sale_id BIGINT NOT NULL REFERENCES sales(sale_id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES product(product_id),
    quantity INT NOT NULL,
    unit_price_at_sale DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sale_id, product_id),
    CONSTRAINT chk_sale_quantity_positive CHECK (quantity > 0)
);

CREATE TABLE financial_record (
    transaction_id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT REFERENCES sales(sale_id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_transaction_type CHECK (transaction_type IN ('SALE', 'PAYMENT', 'REFUND'))
);

CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_sales_employee ON sales(employee_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_financial_record_date ON financial_record(transaction_date);
CREATE INDEX idx_financial_record_type ON financial_record(transaction_type);
CREATE INDEX idx_product_category ON product(category);
CREATE INDEX idx_inventory_product ON inventory(product_id);
