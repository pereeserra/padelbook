const express = require("express");
const router = express.Router();

const courtsController = require("../controllers/courts.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Rutas para obtener las pistas disponibles
router.get("/", authMiddleware, courtsController.getCourts);

module.exports = router;