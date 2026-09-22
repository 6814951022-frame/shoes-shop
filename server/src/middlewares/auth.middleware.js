const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Authentication token is required" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "development-secret-change-me");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired authentication token" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to access this resource" });
  }
  next();
};

module.exports = { requireAuth, requireRole };
