const suspiciousPatterns = [
  /<script/i,
  /union\s+select/i,
  /drop\s+table/i,
  /\.\.\//,
  /%3cscript/i
];

module.exports = (req, res, next) => {
  const queryText = JSON.stringify(req.query || {});
  const bodyText = JSON.stringify(req.body || {});
  const combined = `${req.originalUrl} ${queryText} ${bodyText}`;
  const user = req.session && req.session.user ? req.session.user : null;

  let reason = "";

  if (req.path.startsWith("/admin") && (!user || user.role !== "admin")) {
    reason = "Non-admin attempt on admin route";
  } else if (!req.headers["user-agent"]) {
    reason = "Missing user-agent header";
  } else if (suspiciousPatterns.some((pattern) => pattern.test(combined))) {
    reason = "Suspicious input pattern detected";
  }

  if (reason) {
    console.warn("[SUSPICIOUS_ACTIVITY]", {
      reason,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      userId: user ? user.id : null,
      at: new Date().toISOString()
    });
  }

  next();
};
