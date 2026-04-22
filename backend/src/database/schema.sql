-- ============================================
-- SCHEMA - PadelBook
-- ============================================

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL,
  llinatges VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL,
  telefon VARCHAR(20),
  email_verificat TINYINT(1) DEFAULT 0,
  telefon_verificat TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verification_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_verification_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE courts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom_pista VARCHAR(50) NOT NULL,
  tipus VARCHAR(30),
  coberta TINYINT(1),
  estat VARCHAR(20),
  descripcio TEXT
);

CREATE TABLE time_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hora_inici TIME NOT NULL,
  hora_fi TIME NOT NULL
);

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codi_reserva VARCHAR(30) NOT NULL,
  user_id INT NOT NULL,
  court_id INT NOT NULL,
  time_slot_id INT NOT NULL,
  data_reserva DATE NOT NULL,
  estat VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_reservation_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_reservation_court FOREIGN KEY (court_id) REFERENCES courts(id),
  CONSTRAINT fk_reservation_time_slot FOREIGN KEY (time_slot_id) REFERENCES time_slots(id)
);

CREATE TABLE maintenance_blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  court_id INT NOT NULL,
  time_slot_id INT NOT NULL,
  data_bloqueig DATE NOT NULL,
  motiu VARCHAR(255),

  CONSTRAINT fk_maintenance_court FOREIGN KEY (court_id) REFERENCES courts(id),
  CONSTRAINT fk_maintenance_time_slot FOREIGN KEY (time_slot_id) REFERENCES time_slots(id),

  UNIQUE KEY uq_maintenance_block (court_id, time_slot_id, data_bloqueig)
);

CREATE TABLE admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  accio VARCHAR(100) NOT NULL,
  entitat VARCHAR(100) NOT NULL,
  entitat_id INT,
  descripcio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT admin_logs_ibfk_1 FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- INDEXOS

CREATE INDEX idx_reservations_court_id ON reservations(court_id);

CREATE INDEX idx_reservations_slot_status 
ON reservations(court_id, time_slot_id, data_reserva, estat);

CREATE UNIQUE INDEX uq_reservations_codi_reserva 
ON reservations(codi_reserva);