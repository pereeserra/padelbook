const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Ruta per al registre de nous usuaris
router.post("/register", authController.register);
// Ruta per al login d'usuaris
router.post("/login", authController.login);
// Ruta protegida per obtenir les dades de l'usuari autenticat
router.get("/me", authMiddleware, authController.getMe);
// Ruta protegida per actualitzar les dades d'un usuari autenticat
router.put("/me", authMiddleware, authController.updateMe);
// Ruta protegida per canviar la contrasenya d'un usuari autenticat
router.put("/change-password", authMiddleware, authController.changePassword);

module.exports = router;