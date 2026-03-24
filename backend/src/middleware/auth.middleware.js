const jwt = require("jsonwebtoken");
// Middleware para verificar el token JWT en las rutas protegidas
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionat" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Format de token invàlid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invàlid" });
  }
};