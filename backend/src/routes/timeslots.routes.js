const express = require("express");
const router = express.Router();

const timeslotsController = require("../controllers/timeslots.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Rutas para obtener los horarios disponibles
router.get("/", authMiddleware, timeslotsController.getTimeSlots);

module.exports = router;