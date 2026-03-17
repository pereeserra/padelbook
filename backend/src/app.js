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

app.use("/auth", authRoutes);

// Endpoint de prueba para verificar que el middleware de autenticación funciona
app.get("/private", authMiddleware, (req, res) => {
  res.json({
    message: "Ruta privada correcta",
    user: req.user
  });
});

// Rutes de l'aplicació (protegides per autenticació)
app.use("/courts", courtsRoutes);
app.use("/time-slots", timeslotsRoutes);
app.use("/reservations", reservationsRoutes);
app.use("/admin", adminRoutes);
app.use("/availability", availabilityRoutes);

module.exports = app;