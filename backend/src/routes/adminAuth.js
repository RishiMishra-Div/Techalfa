import { Router } from "express";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { adminIsConfigured, clearSessionCookie, createAdminSession, sessionCookie, verifyAdminPassword } from "../auth/adminAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();
const loginAttempts = new Map();

function isAllowedAttempt(ip) {
  const now = Date.now();
  const item = loginAttempts.get(ip);
  if (!item || item.resetAt <= now) {
    loginAttempts.set(ip, { attempts: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (item.attempts >= 8) return false;
  item.attempts += 1;
  return true;
}

router.post("/login", (req, res) => {
  if (!adminIsConfigured()) return res.status(503).json({ error: "Admin login is not configured on the server." });
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (!isAllowedAttempt(ip)) return res.status(429).json({ error: "Too many login attempts. Try again in 15 minutes." });
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const configuredEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const emailMatches = timingSafeEqual(scryptSync(email, "admin-login", 32), scryptSync(configuredEmail, "admin-login", 32));
  if (!emailMatches || !verifyAdminPassword(password)) return res.status(401).json({ error: "Email or password is incorrect." });
  loginAttempts.delete(ip);
  res.setHeader("Set-Cookie", sessionCookie(createAdminSession(configuredEmail)));
  res.setHeader("Cache-Control", "no-store");
  return res.json({ email: configuredEmail });
});


router.get("/session", requireAdmin, (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ email: req.admin.email });
});



router.post("/logout", (_req, res) => {
  res.setHeader("Set-Cookie", clearSessionCookie());
  res.status(204).end();
});

export default router;
