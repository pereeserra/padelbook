// Middleware per verificar el rol de l'usuari
module.exports = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autenticat",
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: "No tens permisos per accedir a aquesta ruta",
      });
    }

    next();
  };
};