const mysql = require("mysql2/promise");
require("dotenv").config();
// Configuración de la conexión a la base de datos MySQL utilizando un pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "padelbook",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;