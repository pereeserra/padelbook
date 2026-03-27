export function getErrorMessage(err, fallback = "Ha passat un error inesperat.") {
  // Backend error clar
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }

  // Backend message alternatiu
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }

  // Error de xarxa
  if (err?.message === "Network Error") {
    return "No hi ha connexió amb el servidor.";
  }

  // Timeout o server down
  if (err?.code === "ECONNABORTED") {
    return "El servidor ha tardat massa en respondre.";
  }

  return fallback;
}