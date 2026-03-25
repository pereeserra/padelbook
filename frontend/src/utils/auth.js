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

    return {
      ...decodedPayload,
      rol: decodedPayload.rol || decodedPayload.role || null,
    };
  } catch (error) {
    console.error("Error decodificant el token:", error);
    return null;
  }
}