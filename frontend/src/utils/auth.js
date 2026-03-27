// Funció per obtenir l'usuari des del token emmagatzemat al localStorage
export function getUserFromToken() {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);

      return {
        ...parsedUser,
        rol: parsedUser.rol || parsedUser.role || null,
      };
    } catch {
      localStorage.removeItem("user");
    }
  }

  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));

    // Validar expiració del token
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }

    return {
      ...decodedPayload,
      rol: decodedPayload.rol || null,
    };
  } catch (error) {
    console.error("Error decodificant el token:", error);
    return null;
  }
}