const express = require("express");
const router = express.Router();

const reservationsController = require("../controllers/reservations.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Ruta per obtenir totes les reserves de l'usuari autenticat
router.get("/", authMiddleware, reservationsController.getReservations);
// Ruta per obtenir una reserva específica per ID
router.get(
  "/code/:codi_reserva",
  authMiddleware,
  reservationsController.getReservationByCode
);
// Ruta per crear una nova reserva
router.post("/", authMiddleware, reservationsController.createReservation);
// Ruta per eliminar una reserva cancel·lada de forma permanent
router.delete(
  "/:id/permanent",
  authMiddleware,
  reservationsController.deleteCancelledReservationPermanently
);
// Ruta per cancel·lar una reserva (canvia l'estat a 'cancel·lada')
router.delete("/:id", authMiddleware, reservationsController.deleteReservation);

module.exports = router;