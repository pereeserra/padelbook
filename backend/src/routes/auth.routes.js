const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Rate limiters definits a app.js
router.post(
  "/register",
  (req, res, next) => req.app.locals.registerLimiter(req, res, next),
  authController.register
);

router.post(
  "/login",
  (req, res, next) => req.app.locals.authLimiter(req, res, next),
  authController.login
);

router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authMiddleware, authController.resendVerification);

// Ruta protegida per obtenir les dades de l'usuari autenticat
router.get("/me", authMiddleware, authController.getMe);
// Ruta protegida per actualitzar les dades d'un usuari autenticat
router.put("/me", authMiddleware, authController.updateMe);
// Ruta protegida per canviar la contrasenya d'un usuari autenticat
router.put("/change-password", authMiddleware, authController.changePassword);

module.exports = router;