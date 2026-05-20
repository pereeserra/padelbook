const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const adminOrGestorRoles = ["admin", "gestor"];

// Ruta protegida per a administradors per obtenir tots els usuaris
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getAllUsers
);

router.get(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getUserById
);

// Ruta protegida per a administradors per actualitzar el rol d'un usuari
router.put(
  "/users/:id/role",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.updateUserRole
);

// Ruta protegida per a administradors per obtenir totes les reserves
router.get(
  "/reservations",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.getAllReservations
);

// Ruta protegida per a administradors per exportar les reserves a CSV
router.get(
  "/reservations/export/csv",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.exportReservationsCsv
);

// Ruta protegida per a administradors per obtenir una reserva específica
router.get(
  "/reservations/:id",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.getReservationByIdAdmin
);

// Ruta protegida per a administradors per obtenir estadístiques generals
router.get(
  "/stats/overview",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.getOverviewStats
);

// Ruta protegida per a administradors per obtenir estadístiques per pista
router.get(
  "/stats/by-court",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.getReservationsByCourtStats
);

// Ruta protegida per a administradors per obtenir estadístiques per franja horària
router.get(
  "/stats/by-timeslot",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.getReservationsByTimeslotStats
);

// Ruta protegida per a administradors per obtenir estadístiques per data
router.get(
  "/stats/by-date",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.getReservationsByDateStats
);

// Ruta protegida per a administradors per obtenir els logs administratius
router.get(
  "/logs",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.getAdminLogs
);

// Ruta per crear una pista
router.post(
  "/courts",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.createCourt
);

// Ruta per actualitzar una pista
router.put(
  "/courts/:id",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.updateCourt
);

// Ruta per eliminar una pista
router.delete(
  "/courts/:id",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.deleteCourt
);

// Ruta per obtenir tots els bloquejos de manteniment
router.get(
  "/maintenance",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.getAllMaintenanceBlocks
);

// Ruta per crear un bloqueig de manteniment
router.post(
  "/maintenance",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.createMaintenanceBlock
);

// Ruta per actualitzar un bloqueig de manteniment
router.put(
  "/maintenance/:id",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.updateMaintenanceBlock
);

// Ruta per eliminar un bloqueig de manteniment
router.delete(
  "/maintenance/:id",
  authMiddleware,
  roleMiddleware(adminOrGestorRoles),
  adminController.deleteMaintenanceBlock
);

module.exports = router;
