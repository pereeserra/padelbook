const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const authMiddleware = require("./middleware/auth.middleware");
const courtsRoutes = require("./routes/courts.routes");
const timeslotsRoutes = require("./routes/timeslots.routes");
const reservationsRoutes = require("./routes/reservations.routes");
const adminRoutes = require("./routes/admin.routes");
const availabilityRoutes = require("./routes/availability.routes");

const app = express();

// Middleware para permitir solicitudes desde el frontend
app.use(cors());
app.use(express.json());

// Endpoint de prueba para verificar que el servidor funciona
app.get("/", (req, res) => {
  res.json({ message: "API de PadelBook funcionant correctament" });
});

// Endpoint de prueba para verificar la conexión con la base de datos
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json({ message: "Connexió amb MySQL correcta" });
  } catch (error) {
    res.status(500).json({ error: "Error connexió BD" });
  }
});

// Rutes d'autenticació (sense protecció)
app.use("/auth", authRoutes);

// Endpoint de prueba para verificar que el middleware de autenticación funciona
app.get("/private", authMiddleware, (req, res) => {
  res.json({
    message: "Ruta privada correcta",
    user: req.user
  });
});

// Ruta de pistes (protegida per autenticació)
app.use("/courts", courtsRoutes);
// Rutas de franges horàries (protegides per autenticació)
app.use("/time-slots", timeslotsRoutes);
// Rutas de reserves (protegides per autenticació)
app.use("/reservations", reservationsRoutes);
// Ruta d'administració (protegides per autenticació i rol d'admin)
app.use("/admin", adminRoutes);
// Ruta per obtenir la disponibilitat de pistes i franges horàries per a una data concreta (protegida per autenticació)
app.use("/availability", availabilityRoutes);

module.exports = app;