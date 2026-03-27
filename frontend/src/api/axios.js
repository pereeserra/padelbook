import axios from "axios";

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

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (currentPath !== "/login") {
        window.location.href = "/login?session=expired";
      }
    }

    return Promise.reject(error);
  }
);

export default api;