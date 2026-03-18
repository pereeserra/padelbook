// Funció per obtenir l'usuari des del token emmagatzemat al localStorage
export function getUserFromToken() {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
    }
  }

  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload;
  } catch (error) {
    console.error("Error decodificant el token:", error);
    return null;
  }
}
// Funció per comprovar si l'usuari és admin
export function isAdmin() {
  const user = getUserFromToken();
  return user?.rol === "admin";
}
// Funció per comprovar si l'usuari està autenticat
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}