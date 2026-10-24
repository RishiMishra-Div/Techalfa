import { Router } from "express";
import CommunityRegistration from "../models/CommunityRegistration.js";
import ContactMessage from "../models/ContactMessage.js";
import Event from "../models/Event.js";
import Opportunity from "../models/Opportunity.js";
import Resource from "../models/Resource.js";
import MediaAsset from "../models/MediaAsset.js";
import GalleryMedia from "../models/GalleryMedia.js";
import Review from "../models/Review.js";
import PartnerInquiry from "../models/PartnerInquiry.js";
import SiteContent from "../models/SiteContent.js";
import EventFaq from "../models/EventFaq.js";
import { connectToMongo } from "../services/database.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();
const defaultSiteContent = { students: "", events: "", colleges: "", workshops: "", phone: "8830079798", email: "techalfa2026@gmail.com", prize: "" };
const validStatuses = new Set(["Pending", "Approved", "Rejected"]);

function sendDatabaseError(res, error) {
  if (error?.name === "ValidationError" || error?.name === "CastError") return res.status(400).json({ error: "Please check the submitted values." });
  console.error("Admin data request failed:", error?.message);
  return res.status(503).json({ error: "Admin data is temporarily unavailable." });
}

function validatePageContent(res, body) {
  const content = body?.pageContent;
  if (content === undefined) return true;
  let size = 0;
  try { size = Buffer.byteLength(JSON.stringify(content)); } catch { /* invalid content is rejected below */ }
  if (!content || content.type !== "doc" || !Array.isArray(content.content) || size > 200_000) {
    res.status(400).json({ error: "Add valid page content smaller than 200 KB." });
    return false;
  }
  return true;
}

async function removeThumbnail(url) {
  const match = typeof url === "string" && url.match(/^\/api\/media\/([a-f\d]{24})$/i);
  if (match) await MediaAsset.findByIdAndDelete(match[1]);
}

router.use(requireAdmin);


// All routes below this line require admin authentication
router.get("/dashboard", async (_req, res) => {
  try {
    await connectToMongo();
    const [registrations, pending, openEvents, unreadMessages] = await Promise.all([
      CommunityRegistration.countDocuments(),
      CommunityRegistration.countDocuments({ status: "Pending" }),
      Event.countDocuments({ status: "Open" }),
      ContactMessage.countDocuments({ read: false }).then((a) => PartnerInquiry.countDocuments({ read: false }).then((b) => a + b)),
    ]);
    res.json({ registrations, pending, openEvents, unreadMessages });
  } catch (error) { sendDatabaseError(res, error); }
});



// Events management
router.get("/events", async (_req, res) => { 
  try { 
    await connectToMongo(); res.json(await Event.find().sort({ date: 1 }).lean()); 
  } catch (e) { sendDatabaseError(res, e); 
  } });

router.post("/events", async (req, res) => { 
  try {
     if (!validatePageContent(res, req.body)) return;
     await connectToMongo(); res.status(201).json(await Event.create(req.body)); 
    } catch (e) { sendDatabaseError(res, e);
     } });

router.put("/events/:id", async (req, res) => {
   try { 
    if (!validatePageContent(res, req.body)) return;
    await connectToMongo(); 
    const previous = await Event.findById(req.params.id);
    if (!previous) return res.status(404).json({ error: "Event not found." });
    const oldThumbnail = previous.thumbnailUrl;
    previous.set(req.body); await previous.save();
    if (oldThumbnail !== previous.thumbnailUrl) await removeThumbnail(oldThumbnail);
    res.json(previous);
  } catch (e) { sendDatabaseError(res, e); }});

router.delete("/events/:id", async (req, res) => { 
  try { await connectToMongo(); const row = await Event.findByIdAndDelete(req.params.id); if (!row) return res.status(404).json({ error: "Event not found." }); await EventFaq.deleteMany({ $or: [{ eventId: row._id }, { section: "events", entityId: row._id }] }); await removeThumbnail(row.thumbnailUrl); const media = await GalleryMedia.find({ eventId: row._id }).lean(); await GalleryMedia.deleteMany({ eventId: row._id }); await Promise.all(media.map((item) => removeThumbnail(item.url))); res.status(204).end(); 
} catch (e) { sendDatabaseError(res, e); } });

const faqTargetModels = { events: Event, opportunities: Opportunity, resources: Resource };
const faqTargetLabels = { events: "event", opportunities: "opportunity", resources: "resource" };
async function readFaqTarget(section, entityId) {
  const Model = faqTargetModels[section];
  if (!Model) return null;
  return Model.findById(entityId).select("title date").lean();
}
function validFaqText(faq) {
  return typeof faq?.question === "string" && faq.question.trim().length >= 5 && faq.question.trim().length <= 240 && typeof faq?.answer === "string" && faq.answer.trim().length >= 2 && faq.answer.trim().length <= 4000;
}

// FAQs are managed inside each listing section and displayed on its detail page.
router.get("/faqs", async (_req, res) => {
  try {
    await connectToMongo();
    const [faqs, events, opportunities, resources] = await Promise.all([
      EventFaq.find().sort({ createdAt: -1 }).lean(), Event.find().select("title date").lean(), Opportunity.find().select("title").lean(), Resource.find().select("title").lean(),
    ]);
    const targets = new Map([...events.map((item) => [`events:${item._id}`, item]), ...opportunities.map((item) => [`opportunities:${item._id}`, item]), ...resources.map((item) => [`resources:${item._id}`, item])]);
    res.json(faqs.map((faq) => {
      const section = faq.section || "events";
      const entityId = faq.entityId || faq.eventId;
      return { ...faq, section, entityId, entity: targets.get(`${section}:${entityId}`) || null };
    }));
  }
  catch (e) { sendDatabaseError(res, e); }
});
router.post("/faqs", async (req, res) => {
  const { section, entityId, question, answer } = req.body || {};
  if (!faqTargetModels[section] || !/^[a-f\d]{24}$/i.test(entityId || "") || !validFaqText({ question, answer })) return res.status(400).json({ error: "Choose a listing, enter a question (5–240 characters), and an answer (2–4,000 characters)." });
  try {
    await connectToMongo();
    const entity = await readFaqTarget(section, entityId);
    if (!entity) return res.status(404).json({ error: `The selected ${faqTargetLabels[section]} could not be found.` });
    const faq = await EventFaq.create({ section, entityId, ...(section === "events" ? { eventId: entityId } : {}), question, answer });
    res.status(201).json({ ...faq.toObject(), entity });
  } catch (e) { sendDatabaseError(res, e); }
});
router.post("/faqs/import", async (req, res) => {
  const { section, entityId, faqs } = req.body || {};
  if (Buffer.byteLength(JSON.stringify(req.body || {})) > 220_000) return res.status(413).json({ error: "The FAQ import is too large. Split it into smaller batches." });
  if (!faqTargetModels[section] || !/^[a-f\d]{24}$/i.test(entityId || "") || !Array.isArray(faqs) || faqs.length < 1 || faqs.length > 500) return res.status(400).json({ error: "Choose a listing and import between 1 and 500 FAQs at a time." });
  const invalidIndex = faqs.findIndex((faq) => !validFaqText(faq));
  if (invalidIndex !== -1) return res.status(400).json({ error: `FAQ ${invalidIndex + 1} has an invalid question or answer.` });
  try {
    await connectToMongo();
    const entity = await readFaqTarget(section, entityId);
    if (!entity) return res.status(404).json({ error: `The selected ${faqTargetLabels[section]} could not be found.` });
    const created = await EventFaq.insertMany(faqs.map(({ question, answer }) => ({ section, entityId, ...(section === "events" ? { eventId: entityId } : {}), question: question.trim(), answer: answer.trim() })));
    res.status(201).json({ imported: created.length });
  } catch (e) { sendDatabaseError(res, e); }
});
router.put("/faqs/:id", async (req, res) => {
  const { section, entityId, question, answer } = req.body || {};
  if (!faqTargetModels[section] || !/^[a-f\d]{24}$/i.test(entityId || "") || !validFaqText({ question, answer })) return res.status(400).json({ error: "Choose a listing, enter a question (5–240 characters), and an answer (2–4,000 characters)." });
  try {
    await connectToMongo();
    const entity = await readFaqTarget(section, entityId);
    if (!entity) return res.status(404).json({ error: `The selected ${faqTargetLabels[section]} could not be found.` });
    const faq = await EventFaq.findById(req.params.id);
    if (!faq) return res.status(404).json({ error: "FAQ not found." });
    faq.set({ section, entityId, eventId: section === "events" ? entityId : null, question, answer });
    await faq.save();
    res.json({ ...faq.toObject(), entity });
  } catch (e) { sendDatabaseError(res, e); }
});
router.delete("/faqs/:id", async (req, res) => {
  try { await connectToMongo(); const faq = await EventFaq.findByIdAndDelete(req.params.id); if (!faq) return res.status(404).json({ error: "FAQ not found." }); res.status(204).end(); }
  catch (e) { sendDatabaseError(res, e); }
});

// Event gallery media management
router.get("/gallery", async (_req, res) => {
  try { await connectToMongo(); res.json(await GalleryMedia.find().populate("eventId", "title date place status").sort({ createdAt: -1 }).lean()); }
  catch (e) { sendDatabaseError(res, e); }
});
router.post("/gallery", async (req, res) => {
  const { eventId, url, mediaType, caption = "" } = req.body || {};
  const mediaId = typeof url === "string" ? url.match(/^\/api\/media\/([a-f\d]{24})$/i)?.[1] : null;
  if (!/^[a-f\d]{24}$/i.test(eventId || "") || !mediaId || !["image", "video"].includes(mediaType) || typeof caption !== "string" || caption.length > 180) return res.status(400).json({ error: "Choose an event, media file, and a caption under 180 characters." });
  try {
    await connectToMongo();
    const [event, asset] = await Promise.all([Event.findById(eventId), MediaAsset.findById(mediaId).select("contentType")]);
    if (!event) return res.status(404).json({ error: "The selected event could not be found." });
    if (!asset || asset.contentType.startsWith("video/") !== (mediaType === "video")) return res.status(400).json({ error: "The uploaded media file is not available or its type does not match." });
    const media = await GalleryMedia.create({ eventId, url, mediaType, caption, uploadedBy: req.admin.email });
    await media.populate("eventId", "title date place status");
    return res.status(201).json(media);
  } catch (e) { sendDatabaseError(res, e); }
});
router.delete("/gallery/:id", async (req, res) => {
  try { await connectToMongo(); const media = await GalleryMedia.findByIdAndDelete(req.params.id); if (!media) return res.status(404).json({ error: "Gallery item not found." }); await removeThumbnail(media.url); return res.status(204).end(); }
  catch (e) { sendDatabaseError(res, e); }
});

// Student review moderation
router.get("/reviews", async (_req, res) => {
  try { await connectToMongo(); res.json(await Review.find().sort({ createdAt: -1 }).lean()); }
  catch (e) { sendDatabaseError(res, e); }
});
router.patch("/reviews/:id", async (req, res) => {
  if (!["Approved", "Rejected"].includes(req.body?.status)) return res.status(400).json({ error: "Choose Approved or Rejected." });
  try { await connectToMongo(); const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!review) return res.status(404).json({ error: "Review not found." }); res.json(review); }
  catch (e) { sendDatabaseError(res, e); }
});
router.delete("/reviews/:id", async (req, res) => {
  try { await connectToMongo(); const review = await Review.findByIdAndDelete(req.params.id); if (!review) return res.status(404).json({ error: "Review not found." }); await removeThumbnail(review.imageUrl); res.status(204).end(); }
  catch (e) { sendDatabaseError(res, e); }
});


// Opportunities management
router.get("/opportunities", async (_req, res) => { try { await connectToMongo(); res.json(await Opportunity.find().sort({ createdAt: -1 }).lean()); } catch (e) { sendDatabaseError(res, e); } });
router.post("/opportunities", async (req, res) => { try { if (!validatePageContent(res, req.body)) return; await connectToMongo(); res.status(201).json(await Opportunity.create(req.body)); } catch (e) { sendDatabaseError(res, e); } });
router.put("/opportunities/:id", async (req, res) => { try { if (!validatePageContent(res, req.body)) return; await connectToMongo(); const previous = await Opportunity.findById(req.params.id); if (!previous) return res.status(404).json({ error: "Opportunity not found." }); const oldThumbnail = previous.thumbnailUrl; previous.set(req.body); await previous.save(); if (oldThumbnail !== previous.thumbnailUrl) await removeThumbnail(oldThumbnail); res.json(previous); } catch (e) { sendDatabaseError(res, e); } });
router.delete("/opportunities/:id", async (req, res) => { try { await connectToMongo(); const row = await Opportunity.findByIdAndDelete(req.params.id); if (!row) return res.status(404).json({ error: "Opportunity not found." }); await EventFaq.deleteMany({ section: "opportunities", entityId: row._id }); await removeThumbnail(row.thumbnailUrl); res.status(204).end(); } catch (e) { sendDatabaseError(res, e); } });

// Resource management
router.get("/resources", async (_req, res) => { try { await connectToMongo(); res.json(await Resource.find().sort({ createdAt: -1 }).lean()); } catch (e) { sendDatabaseError(res, e); } });
router.post("/resources", async (req, res) => { try { if (!validatePageContent(res, req.body)) return; await connectToMongo(); res.status(201).json(await Resource.create(req.body)); } catch (e) { sendDatabaseError(res, e); } });
router.put("/resources/:id", async (req, res) => { try { if (!validatePageContent(res, req.body)) return; await connectToMongo(); const previous = await Resource.findById(req.params.id); if (!previous) return res.status(404).json({ error: "Resource not found." }); const oldThumbnail = previous.thumbnailUrl; previous.set(req.body); await previous.save(); if (oldThumbnail !== previous.thumbnailUrl) await removeThumbnail(oldThumbnail); res.json(previous); } catch (e) { sendDatabaseError(res, e); } });
router.delete("/resources/:id", async (req, res) => { try { await connectToMongo(); const row = await Resource.findByIdAndDelete(req.params.id); if (!row) return res.status(404).json({ error: "Resource not found." }); await EventFaq.deleteMany({ section: "resources", entityId: row._id }); await removeThumbnail(row.thumbnailUrl); res.status(204).end(); } catch (e) { sendDatabaseError(res, e); } });


// Community registrations management
router.get("/registrations", async (_req, res) => { try { await connectToMongo(); res.json(await CommunityRegistration.find().sort({ createdAt: -1 }).lean()); } catch (e) { sendDatabaseError(res, e); } });
router.patch("/registrations/:id", async (req, res) => {
  if (!validStatuses.has(req.body?.status)) return res.status(400).json({ error: "Choose a valid registration status." });
  try { await connectToMongo(); const row = await CommunityRegistration.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!row) return res.status(404).json({ error: "Registration not found." }); res.json(row); } catch (e) { sendDatabaseError(res, e); }
});


// Get all messages (contacts and partners)
router.get("/messages", async (_req, res) => {
  try {
    await connectToMongo();
    const [contacts, partners] = await Promise.all([ContactMessage.find().sort({ createdAt: -1 }).lean(), PartnerInquiry.find().sort({ createdAt: -1 }).lean()]);
    const messages = [...contacts.map((m) => ({ ...m, source: "contact", from: m.fullName, type: m.enquiryType, text: `${m.subject}\n\n${m.message}` })), ...partners.map((m) => ({ ...m, source: "partner", from: m.fullName, type: m.partnershipType, text: m.message }))].sort((a, b) => b.createdAt - a.createdAt);
    res.json(messages);
  } catch (e) { sendDatabaseError(res, e); }
});
router.patch("/messages/:source/:id", async (req, res) => {
  if (!["contact", "partner"].includes(req.params.source) || typeof req.body?.read !== "boolean") return res.status(400).json({ error: "Invalid message update." });
  try { await connectToMongo(); const Model = req.params.source === "contact" ? ContactMessage : PartnerInquiry; const row = await Model.findByIdAndUpdate(req.params.id, { read: req.body.read }, { new: true }); if (!row) return res.status(404).json({ error: "Message not found." }); res.json({ read: row.read }); } catch (e) { sendDatabaseError(res, e); }
});
router.delete("/messages/:source/:id", async (req, res) => {
  if (!["contact", "partner"].includes(req.params.source)) return res.status(400).json({ error: "Invalid message." });
  try { await connectToMongo(); const Model = req.params.source === "contact" ? ContactMessage : PartnerInquiry; const row = await Model.findByIdAndDelete(req.params.id); if (!row) return res.status(404).json({ error: "Message not found." }); res.status(204).end(); } catch (e) { sendDatabaseError(res, e); }
});



// Site content management
router.get("/site-content", async (_req, res) => {
  try { await connectToMongo(); let row = await SiteContent.findOne({ key: "public" }).lean(); if (!row) row = await SiteContent.create({ key: "public", values: defaultSiteContent }); const values = { ...defaultSiteContent, ...row.values }; for (const [key, sample] of Object.entries({ students: "1000+", events: "25+", colleges: "10+", workshops: "15+", prize: "1,00,000+" })) if (values[key] === sample) values[key] = ""; res.json(values); } catch (e) { sendDatabaseError(res, e); }
});
router.put("/site-content", async (req, res) => {
  const values = req.body?.values;
  if (!values || typeof values !== "object" || Array.isArray(values) || Object.keys(defaultSiteContent).some((key) => typeof values[key] !== "string" || values[key].length > 120)) return res.status(400).json({ error: "Enter valid site content values." });
  try { await connectToMongo(); const row = await SiteContent.findOneAndUpdate({ key: "public" }, { values }, { upsert: true, new: true, runValidators: true }); res.json(row.values); } catch (e) { sendDatabaseError(res, e); }
});

export default router;
