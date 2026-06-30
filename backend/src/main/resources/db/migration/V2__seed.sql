-- Bettina Hardware - Seed Data
-- Role-specific passwords (see CREDENTIALS.md)

-- Admin (password: Admin@Bettina2024)
INSERT INTO app_admin (admin_name, username, password_hash, must_change_password)
VALUES ('Jean Mukamana', 'admin', '$2a$10$OUEAnK1FO1PaA2Yyc1tXPeTI89VMmCffgCi3d/RcjZucYvCn9kreG', FALSE);

-- Employees
INSERT INTO employee (employee_name, role, username, password_hash, status, must_change_password) VALUES
('Alice Uwase', 'CASHIER', 'cashier1', '$2a$10$Qcbetd9/Oe26hqTTuOfZKuKULvS06v4ntj/AFhnn.cqwSId2DM0ry', 'ACTIVE', FALSE),
('Patrick Nshimiyimana', 'SALES_ASSISTANT', 'sales1', '$2a$10$HBIyojoHvJ99fCKZNtqmP.TVWWFY7i61vI5y8siJYDpRvEMuQw2OO', 'ACTIVE', FALSE),
('Eric Habimana', 'MANAGER', 'manager1', '$2a$10$h7c2ZmgxfOD4tPf9fGad/.9v7coSykLxeP68xIXIJjaHcMucWL/n2', 'ACTIVE', FALSE),
('David Mugisha', 'DRIVER', 'driver1', '$2a$10$I/5kgZDCeDU5H3KE1KoE4uKa9.9dLe7vuP.bZYy2HE4xO.WI.gRa6', 'ACTIVE', TRUE);

-- Customers
INSERT INTO customer (customer_name, phone_number, email, address, loyalty_points) VALUES
('Kigali Construction Ltd', '+250788123456', 'info@kigali-construction.rw', 'Kicukiro, Kigali', 45),
('Marie Ingabire', '+250722987654', 'marie.i@email.com', 'Nyarugenge, Kigali', 12),
('Rwanda Builders Co-op', '+250788555123', 'contact@rwandabuilders.rw', 'Gasabo, Kigali', 78),
('Emmanuel Bizimana', '+250783111222', NULL, 'Remera, Kigali', 5);

-- Products (~15 hardware items across categories)
INSERT INTO product (product_name, description, category, unit_price) VALUES
('Corrugated Iron Sheet 3m', 'Galvanized roofing sheet, 3 meter length', 'Roofing Sheets', 18500.00),
('Corrugated Iron Sheet 2.4m', 'Galvanized roofing sheet, 2.4 meter length', 'Roofing Sheets', 15200.00),
('Ridge Cap 3m', 'Roof ridge cap for corrugated sheets', 'Roofing Sheets', 12000.00),
('Dulux Weather Shield 20L', 'Exterior weatherproof paint, white', 'Paints', 85000.00),
('Crown Emulsion 4L', 'Interior emulsion paint, cream', 'Paints', 18500.00),
('Red Oxide Primer 4L', 'Metal primer for rust protection', 'Paints', 22000.00),
('Padlock 50mm Brass', 'Heavy duty brass padlock with 2 keys', 'Padlocks', 8500.00),
('Padlock 40mm Steel', 'Hardened steel padlock', 'Padlocks', 5500.00),
('PVC Pipe 110mm x 3m', 'UPVC drainage pipe', 'Plumbing', 12500.00),
('PVC Elbow 110mm', '90-degree UPVC elbow fitting', 'Plumbing', 3200.00),
('Ball Valve 1/2 inch', 'Brass ball valve for water lines', 'Plumbing', 6800.00),
('LED Bulb 12W E27', 'Energy saving LED bulb, warm white', 'Lighting', 2500.00),
('LED Floodlight 50W', 'Outdoor security floodlight', 'Lighting', 35000.00),
('Claw Hammer 500g', 'Fiberglass handle claw hammer', 'Tools', 12000.00),
('Measuring Tape 5m', 'Steel measuring tape with lock', 'Tools', 4500.00),
('Spirit Level 60cm', 'Aluminum spirit level', 'Tools', 15000.00);

-- Inventory (one per product)
INSERT INTO inventory (product_id, quantity_in_stock, reorder_level)
SELECT product_id,
       CASE category
           WHEN 'Roofing Sheets' THEN 80
           WHEN 'Paints' THEN 25
           WHEN 'Padlocks' THEN 5
           WHEN 'Plumbing' THEN 40
           WHEN 'Lighting' THEN 3
           ELSE 30
       END,
       CASE category
           WHEN 'Roofing Sheets' THEN 20
           WHEN 'Paints' THEN 10
           WHEN 'Padlocks' THEN 15
           WHEN 'Plumbing' THEN 15
           WHEN 'Lighting' THEN 10
           ELSE 10
       END
FROM product;

-- Historical sales (prior month and current month)
-- Sale 1: prior month
INSERT INTO sales (employee_id, customer_id, sale_date, total_amount) VALUES (1, 1, CURRENT_DATE - 35, 55500.00);
INSERT INTO sale_product (sale_id, product_id, quantity, unit_price_at_sale) VALUES
(1, 1, 2, 18500.00),
(1, 7, 2, 8500.00);
INSERT INTO financial_record (sale_id, amount, transaction_date, transaction_type) VALUES (1, 55500.00, CURRENT_DATE - 35, 'SALE');

-- Sale 2: prior month
INSERT INTO sales (employee_id, customer_id, sale_date, total_amount) VALUES (2, 2, CURRENT_DATE - 28, 103500.00);
INSERT INTO sale_product (sale_id, product_id, quantity, unit_price_at_sale) VALUES
(2, 4, 1, 85000.00),
(2, 12, 2, 2500.00),
(2, 15, 3, 4500.00);
INSERT INTO financial_record (sale_id, amount, transaction_date, transaction_type) VALUES (2, 103500.00, CURRENT_DATE - 28, 'SALE');

-- Sale 3: prior month walk-in
INSERT INTO sales (employee_id, customer_id, sale_date, total_amount) VALUES (1, NULL, CURRENT_DATE - 20, 23700.00);
INSERT INTO sale_product (sale_id, product_id, quantity, unit_price_at_sale) VALUES
(3, 9, 1, 12500.00),
(3, 10, 2, 3200.00),
(3, 11, 1, 6800.00);
INSERT INTO financial_record (sale_id, amount, transaction_date, transaction_type) VALUES (3, 23700.00, CURRENT_DATE - 20, 'SALE');

-- Sale 4: current month
INSERT INTO sales (employee_id, customer_id, sale_date, total_amount) VALUES (2, 3, CURRENT_DATE - 10, 142000.00);
INSERT INTO sale_product (sale_id, product_id, quantity, unit_price_at_sale) VALUES
(4, 1, 4, 18500.00),
(4, 3, 2, 12000.00),
(4, 14, 3, 12000.00);
INSERT INTO financial_record (sale_id, amount, transaction_date, transaction_type) VALUES (4, 142000.00, CURRENT_DATE - 10, 'SALE');

-- Sale 5: current month
INSERT INTO sales (employee_id, customer_id, sale_date, total_amount) VALUES (1, 4, CURRENT_DATE - 5, 40500.00);
INSERT INTO sale_product (sale_id, product_id, quantity, unit_price_at_sale) VALUES
(5, 5, 1, 18500.00),
(5, 6, 1, 22000.00);
INSERT INTO financial_record (sale_id, amount, transaction_date, transaction_type) VALUES (5, 40500.00, CURRENT_DATE - 5, 'SALE');

-- Sale 6: today
INSERT INTO sales (employee_id, customer_id, sale_date, total_amount) VALUES (1, 2, CURRENT_DATE, 48500.00);
INSERT INTO sale_product (sale_id, product_id, quantity, unit_price_at_sale) VALUES
(6, 13, 1, 35000.00),
(6, 8, 2, 5500.00),
(6, 12, 1, 2500.00);
INSERT INTO financial_record (sale_id, amount, transaction_date, transaction_type) VALUES (6, 48500.00, CURRENT_DATE, 'SALE');

-- Adjust inventory to reflect historical sales
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 2 WHERE product_id = 1;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 2 WHERE product_id = 7;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 1 WHERE product_id = 4;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 2 WHERE product_id = 12;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 3 WHERE product_id = 15;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 1 WHERE product_id = 9;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 2 WHERE product_id = 10;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 1 WHERE product_id = 11;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 4 WHERE product_id = 1;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 2 WHERE product_id = 3;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 3 WHERE product_id = 14;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 1 WHERE product_id = 5;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 1 WHERE product_id = 6;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 1 WHERE product_id = 13;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 2 WHERE product_id = 8;
UPDATE inventory SET quantity_in_stock = quantity_in_stock - 1 WHERE product_id = 12;

-- Loyalty points from sales (1 point per 1000 RWF)
UPDATE customer SET loyalty_points = loyalty_points + 55 WHERE customer_id = 1;
UPDATE customer SET loyalty_points = loyalty_points + 103 WHERE customer_id = 2;
UPDATE customer SET loyalty_points = loyalty_points + 142 WHERE customer_id = 3;
UPDATE customer SET loyalty_points = loyalty_points + 40 WHERE customer_id = 4;
UPDATE customer SET loyalty_points = loyalty_points + 48 WHERE customer_id = 2;
