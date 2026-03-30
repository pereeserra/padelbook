import axios from "axios";
import { handleSessionExpired } from "../utils/sessionManager";

// Configuració de l'instància d'axios amb la URL base de l'API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// Interceptor per afegir el token d'autenticació a les peticions
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor per gestionar sessions caducades o no autoritzades
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const currentPath = window.location.pathname;

    // 🔴 401 → sessió caducada
    if (status === 401 && currentPath !== "/login") {
      handleSessionExpired();
      return Promise.reject(error);
    }

    // 🟡 Altres errors → deixar passar però normalitzats
    const normalizedError = {
      status,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Error inesperat",
    };

    return Promise.reject(normalizedError);
  }
);

export default api;