const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "IP desconeguda";
};

const logSecurityEvent = (req, event, details = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    event,
    ip: getClientIp(req),
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id || null,
    role: req.user?.role || null,
    ...details,
  };

  console.warn("[SECURITY]", JSON.stringify(payload));
};

module.exports = {
  logSecurityEvent,
};