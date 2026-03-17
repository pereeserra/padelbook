const normalizeText = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const normalizeEmail = (value) => {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
};

const normalizeFullName = (value) => {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
};

const isPositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0;
};

const parsePositiveInteger = (value) => {
  const parsed = Number(value);
  return isPositiveInteger(parsed) ? parsed : null;
};

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

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]{2,}@[^\s@]{2,}\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

const hasMinFullNameLength = (nom, minLength = 5) => {
  return typeof nom === "string" && nom.length >= minLength;
};

const hasNameAndSurname = (nom) => {
  if (typeof nom !== "string") return false;
  const parts = nom.split(" ").filter(Boolean);
  return parts.length >= 2;
};

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

const isValidReservationStatus = (estat) => {
  return estat === "activa" || estat === "cancel·lada";
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
};