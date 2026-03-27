require("./config/env");
const app = require("./app");

const PORT = process.env.PORT || 3000;
// Codi per iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor executant-se a http://localhost:${PORT}`);
});