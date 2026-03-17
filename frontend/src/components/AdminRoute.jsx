import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";

function AdminRoute({ children }) {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;