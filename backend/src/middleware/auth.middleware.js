const jwt = require("jsonwebtoken");
const { logSecurityEvent } = require("../utils/securityLogger");

// Middleware d'autenticació que verifica el token JWT en les sol·licituds entrants
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logSecurityEvent(req, "AUTH_HEADER_INVALID");

    return res.status(401).json({
      error: "No autoritzat",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      rol: decoded.rol || null,
    };

    next();
  } catch (error) {
    logSecurityEvent(req, "AUTH_TOKEN_INVALID", {
      errorMessage: error.message,
    });

    return res.status(401).json({
      error: "No autoritzat",
    });
  }
};