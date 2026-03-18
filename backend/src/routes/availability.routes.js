const express = require("express");
const router = express.Router();

const availabilityController = require("../controllers/availability.controller");

// Ruta per obtenir la disponibilitat de les pistes
router.get("/", availabilityController.getAvailability);

module.exports = router;