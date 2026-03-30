import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";

// Protege una ruta para usuarios autenticados con rol de admin
function AdminRoute({ children }) {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login?session=expired" replace />;
  }
  if (user.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;