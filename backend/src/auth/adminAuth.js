import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

const cookieName = "techalfa_admin";
const sessionAgeSeconds = 8 * 60 * 60;

export function passwordHash(password, salt) {
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyAdminPassword(password) {
  const [algorithm, salt, expectedHex] = (process.env.ADMIN_PASSWORD_HASH || "").split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
  const actual = Buffer.from(passwordHash(password, salt).split("$")[2], "hex");
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function adminIsConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET?.length >= 32);
}

function sign(value) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(value).digest("base64url");
}

export function createAdminSession(email) {
  const payload = Buffer.from(JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + sessionAgeSeconds })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readAdminSession(token) {
  if (!adminIsConfigured() || typeof token !== "string") return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (session.sub !== process.env.ADMIN_EMAIL.trim().toLowerCase() || session.exp <= Date.now() / 1000) return null;
    return session;
  } catch {
    return null;
  }
}

export function sessionCookie(token) {
  const sameSite = process.env.NODE_ENV === "production" ? "None; Secure" : "Lax";
  return `${cookieName}=${token}; Path=/api/admin; HttpOnly; SameSite=${sameSite}; Max-Age=${sessionAgeSeconds}`;
}

export function clearSessionCookie() {
  const sameSite = process.env.NODE_ENV === "production" ? "None; Secure" : "Lax";
  return `${cookieName}=; Path=/api/admin; HttpOnly; SameSite=${sameSite}; Max-Age=0`;
}

export function getSessionFromRequest(req) {
  const cookieHeader = req.get("cookie") || "";
  const cookie = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${cookieName}=`));
  return readAdminSession(cookie?.slice(cookieName.length + 1));
}
