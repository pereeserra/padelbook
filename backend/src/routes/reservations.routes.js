const express = require("express");
const router = express.Router();

const reservationsController = require("../controllers/reservations.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Rutas para gestionar las reservas
router.get("/", authMiddleware, reservationsController.getReservations);
router.get(
  "/code/:codi_reserva",
  authMiddleware,
  reservationsController.getReservationByCode
);
router.post("/", authMiddleware, reservationsController.createReservation);
router.delete("/:id", authMiddleware, reservationsController.deleteReservation);

module.exports = router;