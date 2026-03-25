// Funció per obtenir la IP del client, tenint en compte proxies
const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "IP desconeguda";
};

// Funció per registrar esdeveniments de seguretat
const logSecurityEvent = (req, event, details = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    event,
    ip: getClientIp(req),
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id || null,
    role: req.user?.rol || null,
    ...details,
  };

  console.warn("[SECURITY]", JSON.stringify(payload));
};

module.exports = {
  logSecurityEvent,
};