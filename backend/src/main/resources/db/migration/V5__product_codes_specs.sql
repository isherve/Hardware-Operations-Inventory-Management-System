-- Product barcodes/QR codes + retail specifications for scan lookup

ALTER TABLE product ADD COLUMN brand VARCHAR(100);
ALTER TABLE product ADD COLUMN unit VARCHAR(20) DEFAULT 'PCS';
ALTER TABLE product ADD COLUMN shelf_location VARCHAR(50);
ALTER TABLE product ADD COLUMN manufacturer_code VARCHAR(50);

UPDATE product SET unit = 'PCS' WHERE unit IS NULL;
UPDATE product SET sku = 'BI-' || LPAD(CAST(product_id AS VARCHAR), 4, '0') WHERE sku IS NULL OR TRIM(sku) = '';

UPDATE product SET brand = 'Built In', shelf_location = 'A-' || LPAD(CAST(product_id AS VARCHAR), 2, '0')
WHERE brand IS NULL;

CREATE UNIQUE INDEX uq_product_sku ON product(sku);
CREATE INDEX idx_product_manufacturer_code ON product(manufacturer_code);
