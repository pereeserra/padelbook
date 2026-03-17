const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Rutes per al registre i login d'usuaris
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getMe);
router.put("/me", authMiddleware, authController.updateMe);
router.put("/change-password", authMiddleware, authController.changePassword);

module.exports = router;