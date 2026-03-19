import { Navigate } from "react-router-dom";

// Protege una ruta para usuarios autenticados, sin importar su rol
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;