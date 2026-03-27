require("dotenv").config();

const requiredEnv = [
  "PORT",
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "JWT_SECRET",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Falta la variable d'entorn: ${key}`);
    process.exit(1);
  }
});

module.exports = process.env;