import { Router } from "express";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import Event from "../models/Event.js";
import Student from "../models/Student.js";
import MediaAsset from "../models/MediaAsset.js";
import StudentEventRegistration from "../models/StudentEventRegistration.js";
import requireStudent from "../middleware/requireStudent.js";
import { connectToMongo } from "../services/database.js";

const router = Router();
const authAttempts = new Map();
const dummyPasswordHash = bcrypt.hash("techalfa-invalid-login-comparison", 12);
const cookieName = "ta_student_session";
const clean = (value, max = 300) => typeof value === "string" ? Array.from(value.trim()).filter((c) => { const n = c.codePointAt(0); return n >= 32 && n !== 127; }).join("").slice(0, max) : "";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const profile = (student) => ({ id: String(student._id), name: student.name, email: student.email, college: student.college, headline: student.headline || "", year: student.year || "", city: student.city || "", skills: student.skills || [], github: student.github || "", linkedin: student.linkedin || "", avatarUrl: student.avatarUrl || "", createdAt: student.createdAt });
const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/", maxAge: 7 * 24 * 60 * 60 * 1000 });
const authSecret = () => process.env.STUDENT_JWT_SECRET && Buffer.byteLength(process.env.STUDENT_JWT_SECRET) >= 32 ? process.env.STUDENT_JWT_SECRET : null;
function limitAuth(req, res, next) {
  const key = `${req.ip || req.socket.remoteAddress || "unknown"}:${req.path}`;
  const now = Date.now();
  if (authAttempts.size > 1000) for (const [item, value] of authAttempts) if (value.until <= now) authAttempts.delete(item);
  const current = authAttempts.get(key);
  if (!current || current.until <= now) authAttempts.set(key, { count: 1, until: now + 15 * 60 * 1000 });
  else if (current.count >= 8) return res.status(429).json({ error: "Too many attempts. Please wait a little before trying again." });
  else current.count += 1;
  return next();
}

function issueSession(student, res) {
  const secret = authSecret();
  if (!secret) throw new Error("STUDENT_JWT_SECRET must contain at least 32 bytes.");
  const token = jwt.sign({ ver: student.authVersion || 0 }, secret, { algorithm: "HS256", subject: String(student._id), issuer: "techalfa", audience: "techalfa-students", expiresIn: "7d" });
  res.cookie(cookieName, token, cookieOptions());
}

function mailTransport() {
  const port = Number(process.env.SMTP_PORT || 587);
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !Number.isInteger(port) || port < 1 || port > 65535) return null;
  return { transport: nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: process.env.SMTP_SECURE === "true" || port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } }), from: process.env.SMTP_FROM || process.env.SMTP_USER };
}

async function sendStudentMail(student, subject, text) {
  const mail = mailTransport();
  if (!mail) return false;
  try { await mail.transport.sendMail({ from: mail.from, to: student.email, subject, text }); return true; }
  catch (error) { console.error("Student confirmation email failed:", error.message); return false; }
  finally { mail.transport.close(); }
}

router.post("/register", limitAuth, async (req, res) => {
  const name = clean(req.body?.name, 100);
  const college = clean(req.body?.college, 160);
  const email = clean(req.body?.email, 254).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (name.length < 2 || college.length < 2 || !emailPattern.test(email) || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) return res.status(400).json({ error: "Enter your name, college, valid email, and a password of at least 12 characters (up to 72 UTF-8 bytes)." });
  if (!authSecret()) return res.status(503).json({ error: "Student accounts are not configured yet. Please contact TechAlfa." });
  try {
    await connectToMongo();
    const passwordHash = await bcrypt.hash(password, 12);
    let student;
    try { student = await Student.create({ name, college, email, passwordHash }); }
    catch (error) { if (error.code === 11000) return res.status(409).json({ error: "An account with this email already exists. Sign in instead." }); throw error; }
    issueSession(student, res);
    const sent = await sendStudentMail(student, "Welcome to the TechAlfa Student Portal", `Hi ${student.name},\n\nYour TechAlfa Student Portal account is ready. You can now sign in to manage your profile and register for events.\n\nYour account email: ${student.email}\n\n— TechAlfa India`);
    student.confirmationEmailStatus = sent ? "sent" : "failed";
    await student.save();
    return res.status(201).json({ student: profile(student), emailSent: sent, message: sent ? "Your account is ready. A confirmation email has been sent." : "Your account is ready, but the confirmation email could not be sent. Please contact TechAlfa if it does not arrive." });
  } catch (error) { console.error("Student registration failed:", error.message); return res.status(503).json({ error: "We could not create your account right now. Please try again later." }); }
});

router.post("/login", limitAuth, async (req, res) => {
  const email = clean(req.body?.email, 254).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!emailPattern.test(email) || Buffer.byteLength(password, "utf8") > 72) return res.status(400).json({ error: "Email or password is incorrect." });
  if (!authSecret()) return res.status(503).json({ error: "Student accounts are not configured yet. Please contact TechAlfa." });
  try {
    await connectToMongo();
    const student = await Student.findOne({ email }).select("+passwordHash +authVersion");
    const comparisonHash = student?.passwordHash || await dummyPasswordHash;
    const valid = await bcrypt.compare(password, comparisonHash) && Boolean(student);
    if (!valid) return res.status(401).json({ error: "Email or password is incorrect." });
    issueSession(student, res);
    return res.json({ student: profile(student) });
  } catch (error) { console.error("Student login failed:", error.message); return res.status(503).json({ error: "Sign in is temporarily unavailable. Please try again." }); }
});

router.post("/logout", (_req, res) => res.clearCookie(cookieName, { ...cookieOptions(), maxAge: undefined }).status(204).end());
router.get("/me", requireStudent, (req, res) => res.json({ student: profile(req.student) }));

router.get("/avatar/:id", requireStudent, async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(404).end();
  try {
    const asset = await MediaAsset.findOne({ _id: req.params.id, uploadedBy: `student-avatar:${req.student._id}` }).select("contentType data").lean();
    if (!asset) return res.status(404).end();
    res.set({ "Content-Type": asset.contentType, "Content-Length": asset.data.length, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
    return res.end(asset.data);
  } catch (error) { console.error("Student avatar could not be loaded:", error.message); return res.status(503).end(); }
});

const avatarUploadParser = express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "4mb" });
router.put("/avatar", requireStudent, avatarUploadParser, async (req, res) => {
  const contentType = req.headers["content-type"]?.split(";")[0]?.trim().toLowerCase();
  const data = req.body;
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType) || !Buffer.isBuffer(data) || data.length < 12) return res.status(400).json({ error: "Choose a JPEG, PNG, or WebP profile image up to 4 MB." });
  const valid = contentType === "image/jpeg" ? data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
    : contentType === "image/png" ? data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP";
  if (!valid) return res.status(400).json({ error: "The selected file does not match its image type." });
  try {
    const asset = await MediaAsset.create({ contentType, data, uploadedBy: `student-avatar:${req.student._id}` });
    const student = await Student.findByIdAndUpdate(req.student._id, { $set: { avatarUrl: `/api/students/avatar/${asset.id}` } }, { new: true, runValidators: true });
    const previousId = /^\/api\/students\/avatar\/([a-f\d]{24})$/i.exec(req.student.avatarUrl || "")?.[1];
    if (previousId) await MediaAsset.deleteOne({ _id: previousId, uploadedBy: `student-avatar:${req.student._id}` });
    return res.status(201).json({ student: profile(student) });
  } catch (error) { console.error("Student avatar upload failed:", error.message); return res.status(503).json({ error: "Your profile image could not be saved. Please try again." }); }
});

router.put("/profile", requireStudent, async (req, res) => {
  const fields = {
    name: clean(req.body?.name, 100), college: clean(req.body?.college, 160), headline: clean(req.body?.headline, 120),
    year: clean(req.body?.year, 40), city: clean(req.body?.city, 100), github: clean(req.body?.github, 200), linkedin: clean(req.body?.linkedin, 200),
    skills: Array.isArray(req.body?.skills) ? [...new Set(req.body.skills.map((item) => clean(item, 40)).filter(Boolean))].slice(0, 12) : [],
  };
  if (fields.name.length < 2 || fields.college.length < 2) return res.status(400).json({ error: "Name and college are required." });
  for (const key of ["github", "linkedin"]) if (fields[key] && (!/^https:\/\//i.test(fields[key]) || fields[key].length > 200)) return res.status(400).json({ error: `Enter a valid https link for ${key}.` });
  try { const student = await Student.findByIdAndUpdate(req.student._id, { $set: fields }, { new: true, runValidators: true }); return res.json({ student: profile(student) }); }
  catch (error) { console.error("Student profile update failed:", error.message); return res.status(503).json({ error: "Your profile could not be saved. Please try again." }); }
});

router.put("/password", requireStudent, async (req, res) => {
  const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
  if (newPassword.length < 12 || Buffer.byteLength(newPassword, "utf8") > 72) return res.status(400).json({ error: "Use a new password with at least 12 characters and no more than 72 UTF-8 bytes." });
  try {
    const student = await Student.findById(req.student._id).select("+passwordHash +authVersion");
    if (!student || !await bcrypt.compare(currentPassword, student.passwordHash)) return res.status(400).json({ error: "Your current password is incorrect." });
    student.passwordHash = await bcrypt.hash(newPassword, 12);
    student.authVersion = (student.authVersion || 0) + 1;
    await student.save();
    issueSession(student, res);
    return res.json({ message: "Your password has been changed." });
  } catch (error) { console.error("Student password update failed:", error.message); return res.status(503).json({ error: "Your password could not be changed. Please try again." }); }
});

router.get("/events", requireStudent, async (req, res) => {
  try {
    const registrations = await StudentEventRegistration.find({ studentId: req.student._id }).populate({ path: "eventId", select: "title date time type place status thumbnailUrl" }).sort({ createdAt: -1 }).lean();
    return res.json({ events: registrations.filter((item) => item.eventId).map((item) => ({ ...item.eventId, id: String(item.eventId._id), registration: { id: String(item._id), registrationCode: item.registrationCode, createdAt: item.createdAt } })) });
  } catch (error) { console.error("Student events could not be loaded:", error.message); return res.status(503).json({ error: "Events are temporarily unavailable." }); }
});

router.get("/registrations", requireStudent, async (req, res) => {
  try {
    const registrations = await StudentEventRegistration.find({ studentId: req.student._id }).populate({ path: "eventId", select: "title date time type place status thumbnailUrl" }).sort({ createdAt: -1 }).lean();
    return res.json({ registrations: registrations.filter((item) => item.eventId).map((item) => ({ id: String(item._id), registrationCode: item.registrationCode, createdAt: item.createdAt, emailStatus: item.emailStatus, event: item.eventId })) });
  } catch (error) { console.error("Student registrations could not be loaded:", error.message); return res.status(503).json({ error: "Your registrations are temporarily unavailable." }); }
});

router.post("/events/:eventId/register", requireStudent, async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.eventId)) return res.status(404).json({ error: "Event not found." });
  try {
    const event = await Event.findOne({ _id: req.params.eventId, status: "Open" }).select("title date time type place");
    if (!event) return res.status(404).json({ error: "This event is not open for registration." });
    const registrationCode = `TA-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
    let registration;
    try { registration = await StudentEventRegistration.create({ studentId: req.student._id, eventId: event._id, registrationCode }); }
    catch (error) {
      if (error.code === 11000) {
        const existing = await StudentEventRegistration.findOne({ studentId: req.student._id, eventId: event._id });
        if (existing) return res.status(200).json({ registration: { id: String(existing._id), registrationCode: existing.registrationCode, createdAt: existing.createdAt }, message: "You are already registered for this event." });
      }
      throw error;
    }
    const sent = await sendStudentMail(req.student, `Registration confirmed: ${event.title}`, `Hi ${req.student.name},\n\nYour registration for ${event.title} is confirmed.\n\nRegistration ID: ${registrationCode}\nEvent date: ${event.date}${event.time ? ` at ${event.time}` : ""}\nLocation: ${event.place}\n\n— TechAlfa India`);
    registration.emailStatus = sent ? "sent" : "failed";
    await registration.save();
    return res.status(201).json({ registration: { id: String(registration._id), registrationCode, createdAt: registration.createdAt }, emailSent: sent, message: sent ? "Registration confirmed. Check your email for details." : "Registration confirmed. Email delivery is temporarily unavailable." });
  } catch (error) { console.error("Event registration failed:", error.message); return res.status(503).json({ error: "We could not complete your registration. Please try again." }); }
});

export default router;
