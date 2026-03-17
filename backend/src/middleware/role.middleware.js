// Middleware per verificar el rol de l'usuari
module.exports = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.rol !== requiredRole) {
      return res.status(403).json({
        error: "No tens permisos per accedir a aquesta ruta"
      });
    }

    next();
  };
};