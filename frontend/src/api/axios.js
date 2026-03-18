import axios from "axios";
// Configuració de l'instància d'axios amb la URL base de l'API
const api = axios.create({
  baseURL: "http://localhost:3000",
});
// Interceptor per afegir el token d'autenticació a les peticions
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;