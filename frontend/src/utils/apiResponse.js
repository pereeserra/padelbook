// Funció per obtenir les dades d'una resposta, amb un valor de fallback
export const getResponseData = (response, fallback = null) => {
  return response?.data?.data ?? fallback;
};
// Funció per obtenir una llista de dades d'una resposta, amb un valor de fallback
export const getResponseList = (response) => {
  const data = response?.data?.data;
  return Array.isArray(data) ? data : [];
};
// Funció per obtenir el missatge d'una resposta, amb un valor de fallback
export const getResponseMessage = (response, fallback = "") => {
  return response?.data?.message ?? fallback;
};
// Funció per obtenir el missatge d'error d'una resposta d'error, amb un valor de fallback
export const getErrorMessage = (error, fallback = "S'ha produït un error") => {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};