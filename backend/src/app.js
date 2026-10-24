import express from "express";
import nodemailer from "nodemailer";
import CommunityRegistration from "./models/CommunityRegistration.js";
import ContactMessage from "./models/ContactMessage.js";
import PartnerInquiry from "./models/PartnerInquiry.js";
import MediaAsset from "./models/MediaAsset.js";
import Review from "./models/Review.js";
import adminRouter from "./routes/admin.js";
import adminAuthRouter from "./routes/adminAuth.js";
import contentRouter from "./routes/content.js";
import studentsRouter from "./routes/students.js";
import requireAdmin from "./middleware/requireAdmin.js";
import { connectToMongo, databaseStatus } from "./services/database.js";

const app = express();
const limits = new Map();
const inFlightSubmissions = new Set();
const maxBodyBytes = "256kb";
const allowedStudyYears = new Set(["1st year", "2nd year", "3rd year", "4th year", "Postgraduate", "Other"]);
const allowedInterests = new Set([
  "Events and hackathons",
  "Workshops and learning",
  "Campus leadership",
  "Volunteering and operations",
  "Projects and open source",
  "Other",
]);
const allowedOrigins = new Set((process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173").split(",").map((origin) => origin.trim()).filter(Boolean));
const trustedProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);

app.disable("x-powered-by");
if (Number.isInteger(trustedProxyHops) && trustedProxyHops > 0) app.set("trust proxy", trustedProxyHops);

app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && !allowedOrigins.has(origin)) return res.status(403).json({ error: "This website is not allowed to submit registrations." });
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Submission-Id");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const videoTypes = new Set(["video/mp4", "video/webm"]);
const mediaTypes = new Set([...imageTypes, ...videoTypes]);
const mediaUploadParser = express.raw({ type: [...mediaTypes], limit: "12mb" });

app.post("/api/admin/media", requireAdmin, mediaUploadParser, async (req, res) => {
  const contentType = req.get("content-type")?.split(";")[0].toLowerCase();
  const data = req.body;
  if (!mediaTypes.has(contentType) || !Buffer.isBuffer(data) || data.length === 0) return res.status(400).json({ error: "Choose a PNG, JPEG, WebP, MP4, or WebM file." });
  const validSignature = contentType === "image/png"
    ? data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : contentType === "image/jpeg"
      ? data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
      : contentType === "image/webp"
        ? data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP"
        : contentType === "video/mp4"
          ? data.length >= 12 && data.toString("ascii", 4, 8) === "ftyp"
          : data.length >= 4 && data.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  if (!validSignature) return res.status(400).json({ error: "The uploaded file does not match its format." });
  try {
    await connectToMongo();
    const asset = await MediaAsset.create({ contentType, data, uploadedBy: req.admin.email });
    return res.status(201).json({ url: `/api/media/${asset.id}` });
  } catch (error) {
    console.error("Media upload failed:", error.message);
    return res.status(503).json({ error: "The media file could not be saved. Please try again." });
  }
});

app.delete("/api/admin/media/:id", requireAdmin, async (req, res) => {
  try {
    await connectToMongo();
    const asset = await MediaAsset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ error: "Image not found." });
    return res.status(204).end();
  } catch (error) {
    console.error("Thumbnail removal failed:", error.message);
    return res.status(503).json({ error: "The image could not be removed." });
  }
});

app.post("/api/reviews", express.json({ limit: "6mb", type: "application/json" }), async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) return res.status(429).json({ error: "Too many submissions. Please wait a little before trying again." });
  const name = clean(req.body?.name);
  const college = clean(req.body?.college);
  const course = clean(req.body?.course);
  const review = clean(req.body?.review);
  const rating = Number(req.body?.rating);
  if (clean(req.body?.website)) return res.status(400).json({ error: "Your review could not be submitted." });
  if (name.length < 2 || name.length > 100) return res.status(400).json({ error: "Enter a name between 2 and 100 characters." });
  if (college.length < 2 || college.length > 160) return res.status(400).json({ error: "Enter your college or university." });
  if (course.length > 100) return res.status(400).json({ error: "Keep your course or year under 100 characters." });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: "Choose a rating from 1 to 5 stars." });
  if (review.length < 10 || review.length > 1200) return res.status(400).json({ error: "Write a review between 10 and 1,200 characters." });
  if (req.body?.consent !== true) return res.status(400).json({ error: "Please confirm your review may be published if approved." });

  const image = req.body?.image;
  let imageData = null;
  if (image !== undefined && image !== null) {
    const types = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!types.has(image.contentType) || typeof image.data !== "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(image.data)) return res.status(400).json({ error: "Choose a PNG, JPEG, or WebP photo." });
    const data = Buffer.from(image.data, "base64");
    if (!data.length || data.length > 4 * 1024 * 1024) return res.status(400).json({ error: "Your photo must be 4 MB or smaller." });
    const isValid = image.contentType === "image/png"
      ? data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : image.contentType === "image/jpeg"
        ? data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
        : data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP";
    if (!isValid) return res.status(400).json({ error: "The photo does not match its file type." });
    imageData = { contentType: image.contentType, data };
  }
  let asset;
  try {
    await connectToMongo();
    if (imageData) asset = await MediaAsset.create({ ...imageData, uploadedBy: "student-review" });
    await Review.create({ name, college, course, rating, review, consent: true, imageUrl: asset ? `/api/media/${asset.id}` : "" });
    return res.status(201).json({ message: "Thanks! Your review has been submitted for approval." });
  } catch (error) {
    if (asset) await MediaAsset.findByIdAndDelete(asset._id).catch(() => {});
    console.error("Student review could not be saved:", error.message);
    return res.status(503).json({ error: "We could not save your review. Please try again later." });
  }
});

app.use(express.json({ limit: maxBodyBytes, type: "application/json" }));

function clean(value) {
  return typeof value === "string"
    ? Array.from(value.trim()).filter((character) => {
        const code = character.codePointAt(0);
        return code >= 32 && code !== 127;
      }).join("")
    : "";
}

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  if (limits.size > 1000) {
    for (const [key, value] of limits) if (value.resetAt <= now) limits.delete(key);
  }
  const current = limits.get(ip);
  if (!current || current.resetAt <= now) {
    limits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= 5) return false;
  current.count += 1;
  return true;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: databaseStatus() });
});

app.get("/", (_req, res) => {
  res.json({ name: "TechAlfa API", status: "ok", health: "/api/health" });
});

app.post("/api/community-registration", async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many submissions. Please wait a little before trying again." });
  }

  const requestId = clean(req.get("x-submission-id"));
  const submission = {
    name: clean(req.body?.name),
    email: clean(req.body?.email),
    college: clean(req.body?.college),
    studyYear: clean(req.body?.studyYear),
    interests: clean(req.body?.interests),
    message: clean(req.body?.message),
    consent: req.body?.consent === true,
  };
  const errors = [];
  if (!/^[0-9a-f-]{16,64}$/i.test(requestId)) errors.push("Refresh the form and try again.");
  if (submission.name.length < 2 || submission.name.length > 100) errors.push("Enter a name between 2 and 100 characters.");
  if (submission.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) errors.push("Enter a valid email address.");
  if (submission.college.length < 2 || submission.college.length > 160) errors.push("Enter your college or university.");
  if (!allowedStudyYears.has(submission.studyYear)) errors.push("Select a valid year of study.");
  if (!allowedInterests.has(submission.interests)) errors.push("Select an area of interest.");
  if (submission.message.length > 1200) errors.push("Keep the additional message under 1,200 characters.");
  if (!submission.consent) errors.push("Please confirm that TechAlfa may use these details to respond.");
  if (errors.length) return res.status(400).json({ error: errors[0], fields: errors });

  const { MONGODB_URI, HR_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  const mailPort = Number(SMTP_PORT || 587);
  if (!MONGODB_URI || !HR_EMAIL || !SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !Number.isInteger(mailPort) || mailPort < 1 || mailPort > 65535) {
    return res.status(503).json({ error: "The registration service is not available yet. Please try again later." });
  }
  if (inFlightSubmissions.has(requestId)) return res.status(409).json({ error: "This registration is already being processed." });
  inFlightSubmissions.add(requestId);

  try {
    try {
      await connectToMongo();
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
      return res.status(503).json({ error: "The registration service is temporarily unavailable. Please try again later." });
    }

    let registration;
    try {
      registration = await CommunityRegistration.findOne({ requestId });
      if (registration?.emailStatus === "sent") return res.status(202).json({ message: "Registration accepted." });
      if (!registration) registration = new CommunityRegistration({ requestId, ...submission });
      else registration.set({ ...submission, emailStatus: "pending" });
      await registration.save();
    } catch (error) {
      console.error("Community registration could not be saved:", error.message);
      return res.status(503).json({ error: "We could not save your registration. Please try again later." });
    }

    const secure = process.env.SMTP_SECURE === "true" || mailPort === 465;
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: mailPort,
      secure,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
    const from = process.env.SMTP_FROM || SMTP_USER;
    const text = [
      "New TechAlfa Community Registration",
      "",
      `Full name: ${submission.name}`,
      `Email: ${submission.email}`,
      `College or university: ${submission.college}`,
      `Year of study: ${submission.studyYear}`,
      `Area of interest: ${submission.interests}`,
      `Additional information: ${submission.message || "Not provided"}`,
      `Consent to follow up: ${submission.consent ? "Yes" : "No"}`,
      `Registration ID: ${requestId}`,
    ].join("\n");

    try {
      await transport.sendMail({ from, to: HR_EMAIL, replyTo: submission.email, subject: "New TechAlfa Community Registration", text });
      registration.emailStatus = "sent";
      await registration.save();
      return res.status(202).json({ message: "Registration accepted." });
    } catch (error) {
      registration.emailStatus = "failed";
      await registration.save().catch((saveError) => console.error("Could not update registration delivery status:", saveError.message));
      console.error("Community registration email failed:", error.message);
      return res.status(502).json({ error: "We could not send your registration right now. Please try again later." });
    } finally {
      transport.close();
    }
  } finally {
    inFlightSubmissions.delete(requestId);
  }
});

const emailSettings = () => {
  const port = Number(process.env.SMTP_PORT || 587);
  if (!process.env.MONGODB_URI || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !Number.isInteger(port) || port < 1 || port > 65535) return null;
  return { port, host: process.env.SMTP_HOST, user: process.env.SMTP_USER, password: process.env.SMTP_PASSWORD, from: process.env.SMTP_FROM || process.env.SMTP_USER };
};

async function saveAndNotify({ req, res, Model, fields, recipient, subject, validate }) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) return res.status(429).json({ error: "Too many submissions. Please wait a little before trying again." });
  const requestId = clean(req.get("x-submission-id"));
  const data = Object.fromEntries(fields.map((field) => [field, clean(req.body?.[field])]));
  const errors = validate(data);
  if (!/^[0-9a-f-]{16,64}$/i.test(requestId)) errors.unshift("Refresh the form and try again.");
  if (req.body?.consent !== true) errors.push("Please confirm that TechAlfa may use these details to respond.");
  if (errors.length) return res.status(400).json({ error: errors[0], fields: errors });
  const mail = emailSettings();
  const to = recipient;
  if (inFlightSubmissions.has(requestId)) return res.status(409).json({ error: "This enquiry is already being processed." });
  inFlightSubmissions.add(requestId);
  try {
    try { await connectToMongo(); }
    catch (error) { console.error("MongoDB connection failed:", error.message); return res.status(503).json({ error: "The enquiry service is temporarily unavailable. Please try again later." }); }
    let record;
    try {
      record = await Model.findOne({ requestId });
      if (record?.emailStatus === "sent") return res.status(202).json({ message: "Enquiry accepted." });
      if (!record) record = new Model({ requestId, ...data, consent: true });
      else record.set({ ...data, consent: true, emailStatus: "pending" });
      await record.save();
    } catch (error) { console.error("Enquiry could not be saved:", error.message); return res.status(503).json({ error: "We could not save your enquiry. Please try again later." }); }
    if (!mail || !to) {
      record.emailStatus = "failed";
      await record.save().catch((error) => console.error("Could not record email status:", error.message));
      return res.status(202).json({ message: "Your enquiry was received and is available to the TechAlfa team in the admin panel." });
    }
    const transport = nodemailer.createTransport({ host: mail.host, port: mail.port, secure: process.env.SMTP_SECURE === "true" || mail.port === 465, auth: { user: mail.user, pass: mail.password } });
    try {
      await transport.sendMail({ from: mail.from, to, replyTo: data.email, subject, text: [subject, "", ...Object.entries(data).map(([key, value]) => `${key}: ${value || "Not provided"}`), `Consent: yes`, `Request ID: ${requestId}`].join("\n") });
      record.emailStatus = "sent"; await record.save();
      return res.status(202).json({ message: "Enquiry accepted." });
    } catch (error) {
      record.emailStatus = "failed"; await record.save().catch((saveError) => console.error("Could not update email status:", saveError.message));
      console.error("Enquiry email failed:", error.message);
      return res.status(202).json({ message: "Your enquiry was received and is available to the TechAlfa team in the admin panel." });
    } finally { transport.close(); }
  } finally { inFlightSubmissions.delete(requestId); }
}

app.post("/api/contact-messages", (req, res) => saveAndNotify({
  req, res, Model: ContactMessage,
  fields: ["fullName", "email", "phone", "organization", "enquiryType", "subject", "message"],
  recipient: process.env.CONTACT_EMAIL || "techalfa2026@gmail.com",
  subject: "New TechAlfa website enquiry",
  validate: (d) => [
    ...(d.fullName.length < 2 || d.fullName.length > 100 ? ["Enter a name between 2 and 100 characters."] : []),
    ...(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || d.email.length > 254 ? ["Enter a valid email address."] : []),
    ...(d.phone.length > 30 ? ["Enter a phone number under 30 characters."] : []),
    ...(d.organization.length > 160 ? ["Keep the organization name under 160 characters."] : []),
    ...(!["General enquiry", "Event", "Opportunity", "Partnership", "Sponsorship", "College collaboration", "Workshop / speaker", "Volunteering", "Media / PR", "Other", "Event participation", "Media"].includes(d.enquiryType) ? ["Select a valid enquiry type."] : []),
    ...(d.subject.length < 2 || d.subject.length > 160 ? ["Enter a subject between 2 and 160 characters."] : []),
    ...(d.message.length < 2 || d.message.length > 2000 ? ["Enter a message under 2,000 characters."] : []),
  ],
}));

app.post("/api/partner-inquiries", (req, res) => saveAndNotify({
  req, res, Model: PartnerInquiry,
  fields: ["fullName", "email", "organization", "partnershipType", "message"],
  recipient: process.env.PARTNERS_EMAIL || process.env.CONTACT_EMAIL || "techalfa2026@gmail.com",
  subject: "New TechAlfa partnership enquiry",
  validate: (d) => [
    ...(d.fullName.length < 2 || d.fullName.length > 100 ? ["Enter a name between 2 and 100 characters."] : []),
    ...(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || d.email.length > 254 ? ["Enter a valid email address."] : []),
    ...(d.organization.length < 2 || d.organization.length > 160 ? ["Enter an organization name."] : []),
    ...(!["Event sponsorship", "Workshop or speaker", "Campus collaboration", "Hiring and opportunities", "Media partnership", "Other"].includes(d.partnershipType) ? ["Select a valid partnership type."] : []),
    ...(d.message.length < 2 || d.message.length > 2000 ? ["Enter a message under 2,000 characters."] : []),
  ],
}));

app.use("/api/content", contentRouter);
app.use("/api/students", studentsRouter);
app.use("/api/admin", adminAuthRouter);
app.use("/api/admin", adminRouter);
app.get("/api/media/:id", async (req, res) => {
  try {
    await connectToMongo();
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(404).end();
    const asset = await MediaAsset.findById(req.params.id).select("contentType data");
    if (!asset) return res.status(404).end();
    const image = Buffer.isBuffer(asset.data) ? asset.data : Buffer.from(asset.data);
    res.setHeader("Content-Type", asset.contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.send(image);
  } catch (error) {
    console.error("Thumbnail could not be loaded:", error.message);
    return res.status(503).end();
  }
});
app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found." }));
app.use((error, _req, res, _next) => {
  if (error.type === "entity.too.large") return res.status(413).json({ error: "The submitted information is too large." });
  if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ error: "The request body must be valid JSON." });
  console.error("Unexpected API error:", error.message);
  return res.status(500).json({ error: "An unexpected error occurred." });
});

export default app;
