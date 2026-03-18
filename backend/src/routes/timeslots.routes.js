const express = require("express");
const router = express.Router();

const timeslotsController = require("../controllers/timeslots.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Ruta per obtenir els horaris disponibles per a una pista i data específica
router.get("/", authMiddleware, timeslotsController.getTimeSlots);

module.exports = router;