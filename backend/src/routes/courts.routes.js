const express = require("express");
const router = express.Router();

const courtsController = require("../controllers/courts.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Ruta per obtenir les pistes amb filtres opcionals
router.get("/", authMiddleware, courtsController.getCourts);

module.exports = router;