-- Extra staff users and customers

INSERT INTO employee (employee_name, role, username, password_hash, status, must_change_password) VALUES
('Grace Mukamana', 'CASHIER', 'cashier2', '$2a$10$Qcbetd9/Oe26hqTTuOfZKuKULvS06v4ntj/AFhnn.cqwSId2DM0ry', 'ACTIVE', FALSE),
('Jean Claude Niyonkuru', 'SALES_ASSISTANT', 'sales2', '$2a$10$HBIyojoHvJ99fCKZNtqmP.TVWWFY7i61vI5y8siJYDpRvEMuQw2OO', 'ACTIVE', FALSE),
('Claudine Uwimana', 'MANAGER', 'manager2', '$2a$10$h7c2ZmgxfOD4tPf9fGad/.9v7coSykLxeP68xIXIJjaHcMucWL/n2', 'ACTIVE', FALSE),
('Samuel Habineza', 'DRIVER', 'driver2', '$2a$10$I/5kgZDCeDU5H3KE1KoE4uKa9.9dLe7vuP.bZYy2HE4xO.WI.gRa6', 'ACTIVE', FALSE),
('Diane Iradukunda', 'CASHIER', 'cashier3', '$2a$10$Qcbetd9/Oe26hqTTuOfZKuKULvS06v4ntj/AFhnn.cqwSId2DM0ry', 'ACTIVE', FALSE);

INSERT INTO customer (customer_name, phone_number, email, address, loyalty_points) VALUES
('Amahoro Hardware Supplies', '+250788111222', 'orders@amahoro.rw', 'Nyamirambo, Kigali', 22),
('Pacifique Ndayisaba', '+250722334455', 'pacifique.n@email.com', 'Kimironko, Kigali', 8),
('Ubumwe Construction Co.', '+250788667788', 'info@ubumwe.rw', 'Gikondo, Kigali', 56),
('Solange Mukeshimana', '+250783445566', 'solange.m@email.com', 'Kacyiru, Kigali', 15),
('Kigali Roofing Experts', '+250788998877', 'sales@kigaliroofing.rw', 'Kanombe, Kigali', 34),
('Innocent Habimana', '+250722556677', NULL, 'Muhima, Kigali', 3),
('Vision Build Ltd', '+250788223344', 'contact@visionbuild.rw', 'Remera, Kigali', 41),
('Chantal Uwase', '+250783778899', 'chantal.u@email.com', 'Kicukiro, Kigali', 19);
