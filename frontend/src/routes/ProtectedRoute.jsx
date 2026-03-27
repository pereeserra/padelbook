import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";

// Protege una ruta para usuarios autenticados, sin importar su rol
function ProtectedRoute({ children }) {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;