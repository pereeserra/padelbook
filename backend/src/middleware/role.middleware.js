// Middleware per verificar el rol de l'usuari
module.exports = (requiredRole) => {
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autenticat",
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        error: "No tens permisos per accedir a aquesta ruta",
      });
    }

    next();
  };
};
