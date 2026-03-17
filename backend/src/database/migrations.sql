-- ============================================
-- MIGRATIONS - PadelBook
-- ============================================

-- ============================================
-- MIGRATION 001 - Correcció sistema de reserves
-- ============================================

-- Eliminació de la restricció UNIQUE antiga
-- que impedia reservar després de cancel·lar

-- (Nom de l’índex pot variar segons implementació)
-- Exemple:
-- ALTER TABLE reservations DROP INDEX uq_reservations_antiga;


-- ============================================
-- MIGRATION 002 - Afegir codi únic de reserva
-- ============================================

-- Afegir columna
-- ALTER TABLE reservations ADD COLUMN codi_reserva VARCHAR(30);

-- Omplir dades existents
-- UPDATE reservations SET codi_reserva = ...

-- Afegir restricció UNIQUE
-- ALTER TABLE reservations ADD UNIQUE (codi_reserva);


-- NOTA:
-- Actualment aquest camp ja forma part de schema.sql
-- però es manté aquí com a documentació d’evolució del projecte