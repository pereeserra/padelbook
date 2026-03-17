-- ============================================
-- SEED - PadelBook
-- ============================================

-- USUARIS

INSERT INTO users (nom, email, password_hash, rol) VALUES
('Admin', 'admin@padelbook.com', '$2b$10$hashadmin', 'admin'),
('Usuari Test', 'user@padelbook.com', '$2b$10$hashuser', 'usuari');


-- PISTES

INSERT INTO courts (nom_pista, tipus, coberta, estat, descripcio) VALUES
('Pista 1', 'dobles', 1, 'disponible', 'Pista coberta'),
('Pista 2', 'dobles', 0, 'disponible', 'Pista exterior'),
('Pista 3', 'individual', 1, 'manteniment', 'Pista en manteniment');


-- FRANGES HORÀRIES

INSERT INTO time_slots (hora_inici, hora_fi) VALUES
('08:00:00', '09:30:00'),
('09:30:00', '11:00:00'),
('11:00:00', '12:30:00'),
('16:00:00', '17:30:00'),
('17:30:00', '19:00:00'),
('19:00:00', '20:30:00');