const { RESERVATION_STATUS } = require("../config/reservationConstants");

// Funciones de validación y normalización de datos
const normalizeText = (value) => {
  return typeof value === "string" ? value.trim() : "";
};
// Función para normalizar correos electrónicos (trim y lowercase)
const normalizeEmail = (value) => {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
};
// Función para normalizar nombres completos (trim y reemplazo de múltiples espacios por uno)
const normalizeFullName = (value) => {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
};
// Función para verificar si un valor es un entero positivo
const isPositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0;
};
// Función para convertir un valor a un entero positivo o devolver null si no es válido
const parsePositiveInteger = (value) => {
  const parsed = Number(value);
  return isPositiveInteger(parsed) ? parsed : null;
};
// Función para validar el formato de fecha YYYY-MM-DD y que sea una fecha válida
const isValidDateFormat = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;

  const [year, month, day] = dateString.split("-").map(Number);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
};
// Función para obtener la fecha actual en formato YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
// Función para validar el formato de correo electrónico
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]{2,}@[^\s@]{2,}\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};
// Función para validar que el nombre completo tenga al menos una longitud mínima
const hasMinFullNameLength = (nom, minLength = 5) => {
  return typeof nom === "string" && nom.length >= minLength;
};
// Función para validar que el nombre completo contenga al menos un nombre y un apellido
const hasNameAndSurname = (nom) => {
  if (typeof nom !== "string") return false;
  const parts = nom.split(" ").filter(Boolean);
  return parts.length >= 2;
};
// Función para validar la fortaleza de la contraseña
const validatePasswordStrength = (password) => {
  if (typeof password !== "string" || password.length === 0) {
    return "Has d'introduir una contrasenya.";
  }

  if (password.length < 8) {
    return "La contrasenya ha de tenir almenys 8 caràcters.";
  }

  if (!/[a-z]/.test(password)) {
    return "La contrasenya ha d'incloure almenys una lletra minúscula.";
  }

  if (!/[A-Z]/.test(password)) {
    return "La contrasenya ha d'incloure almenys una lletra majúscula.";
  }

  if (!/[0-9]/.test(password)) {
    return "La contrasenya ha d'incloure almenys un número.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "La contrasenya ha d'incloure almenys un símbol.";
  }

  return null;
};
// Función para validar que el estado de la reserva sea válido
const isValidReservationStatus = (estat) => {
  return Object.values(RESERVATION_STATUS).includes(estat);
};

const parseBinaryFlag = (value) => {
  if (value === 1 || value === "1" || value === true || value === "true") {
    return 1;
  }
  if (value === 0 || value === "0" || value === false || value === "false") {
    return 0;
  }
  return null;
};

const validateCourtData = (data) => {
  let { nom_pista, tipus, coberta, estat, descripcio, preu_reserva } = data;

  nom_pista = normalizeText(nom_pista);
  tipus = normalizeText(tipus).toLowerCase();
  estat = normalizeText(estat).toLowerCase();
  descripcio = normalizeText(descripcio);
  coberta = parseBinaryFlag(coberta);
  let parsedPreu = 0;
  if (preu_reserva !== undefined && preu_reserva !== null && preu_reserva !== "") {
    parsedPreu = Number(preu_reserva);
    if (Number.isNaN(parsedPreu) || parsedPreu < 0) {
      return { error: "El preu de reserva no és vàlid" };
    }
  }
  preu_reserva = parsedPreu;

  const allowedCourtStatuses = ["disponible", "manteniment"];
  const allowedCourtTypes = ["dobles", "individual"];

  if (!nom_pista || !tipus || coberta === null || !estat) {
    return { error: "Falten dades obligatòries per a la pista" };
  }

  if (nom_pista.length < 3) {
    return { error: "El nom de la pista ha de tenir almenys 3 caràcters" };
  }

  if (!allowedCourtTypes.includes(tipus)) {
    return { error: `El tipus de pista no és vàlid. Valors permesos: ${allowedCourtTypes.join(", ")}` };
  }

  if (!allowedCourtStatuses.includes(estat)) {
    return { error: `L'estat de la pista no és vàlid. Valors permesos: ${allowedCourtStatuses.join(", ")}` };
  }

  return { error: null, data: { nom_pista, tipus, coberta, estat, descripcio, preu_reserva } };
};

const validateProfileData = (nom, email) => {
  if (nom.length > 100) {
    return { error: "El nom és massa llarg." };
  }
  if (email.length > 150) {
    return { error: "El correu és massa llarg." };
  }
  if (!nom || !email) {
    return { error: "Has d'omplir nom i correu electrònic." };
  }
  if (!hasMinFullNameLength(nom)) {
    return { error: "El nom complet ha de tenir almenys 5 caràcters." };
  }
  if (!hasNameAndSurname(nom)) {
    return { error: "Has d'introduir com a mínim nom i llinatge." };
  }
  if (!isValidEmail(email)) {
    return { error: "Introdueix un correu electrònic vàlid." };
  }
  return { error: null };
};

module.exports = {
  normalizeText,
  normalizeEmail,
  normalizeFullName,
  isPositiveInteger,
  parsePositiveInteger,
  isValidDateFormat,
  getTodayString,
  isValidEmail,
  hasMinFullNameLength,
  hasNameAndSurname,
  validatePasswordStrength,
  isValidReservationStatus,
  parseBinaryFlag,
  validateCourtData,
  validateProfileData,
};