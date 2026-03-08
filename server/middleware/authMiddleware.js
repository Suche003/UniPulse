import jwt from "jsonwebtoken";

/**
 * Verifies JWT from Authorization: Bearer <token>
 * Attaches payload to req.user
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload contains: { sub, role, iat, exp }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

/**
 * Role gate. Usage: requireRole("superadmin") OR requireRole("club","superadmin")
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}