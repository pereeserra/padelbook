const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Ruta protegida per a administradors per obtenir tots els usuaris
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getAllUsers
);

// Ruta protegida per a administradors per obtenir totes les reserves
router.get(
  "/reservations",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getAllReservations
);

// Ruta protegida per a administradors per exportar les reserves a CSV
router.get(
  "/reservations/export/csv",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.exportReservationsCsv
);

// Ruta protegida per a administradors per obtenir una reserva específica
router.get(
  "/reservations/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getReservationByIdAdmin
);

// Ruta protegida per a administradors per obtenir estadístiques generals
router.get(
  "/stats/overview",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getOverviewStats
);

// Ruta protegida per a administradors per obtenir estadístiques per pista
router.get(
  "/stats/by-court",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getReservationsByCourtStats
);

// Ruta protegida per a administradors per obtenir estadístiques per franja horària
router.get(
  "/stats/by-timeslot",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getReservationsByTimeslotStats
);

// Ruta protegida per a administradors per obtenir estadístiques per data
router.get(
  "/stats/by-date",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getReservationsByDateStats
);

// Ruta protegida per a administradors per obtenir els logs administratius
router.get(
  "/logs",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getAdminLogs
);

// Ruta per crear una pista
router.post(
  "/courts",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.createCourt
);

// Ruta per actualitzar una pista
router.put(
  "/courts/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.updateCourt
);

// Ruta per eliminar una pista
router.delete(
  "/courts/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.deleteCourt
);

// Ruta per crear un bloqueig de manteniment
router.post(
  "/maintenance",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.createMaintenanceBlock
);

module.exports = router;