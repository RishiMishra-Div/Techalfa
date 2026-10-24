import { getSessionFromRequest } from "../auth/adminAuth.js";

export default function requireAdmin(req, res, next) {
  const session = getSessionFromRequest(req);
  if (!session) return res.status(401).json({ error: "Please sign in to continue." });
  req.admin = { email: session.sub };
  next();
}
