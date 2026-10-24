import { Router } from "express";
import Event from "../models/Event.js";
import Opportunity from "../models/Opportunity.js";
import Resource from "../models/Resource.js";
import SiteContent from "../models/SiteContent.js";
import GalleryMedia from "../models/GalleryMedia.js";
import Review from "../models/Review.js";
import EventFaq from "../models/EventFaq.js";
import { connectToMongo } from "../services/database.js";

const router = Router();
const defaults = { students: "", events: "", colleges: "", workshops: "", phone: "8830079798", email: "techalfa2026@gmail.com", prize: "" };
const publicSiteValues = (values = {}) => {
  const result = { ...defaults, ...values };
  for (const [key, sample] of Object.entries({ students: "1000+", events: "25+", colleges: "10+", workshops: "15+", prize: "1,00,000+" })) if (result[key] === sample) result[key] = "";
  return result;
};

router.get("/", async (_req, res) => {
  try {
    await connectToMongo();
    const [events, opportunities, resources, gallery, reviews, faqs, settings] = await Promise.all([
      Event.find({ status: { $in: ["Open", "Completed"] } }).sort({ date: 1 }).lean(),
      Opportunity.find({ status: "Live" }).sort({ createdAt: -1 }).lean(),
      Resource.find({ status: "Live" }).sort({ createdAt: -1 }).lean(),
      GalleryMedia.find().populate({ path: "eventId", select: "title date place status", match: { status: { $in: ["Open", "Completed"] } } }).sort({ createdAt: -1 }).lean(),
      Review.find({ status: "Approved" }).select("name college course rating review imageUrl createdAt").sort({ createdAt: -1 }).limit(12).lean(),
      EventFaq.find().select("section entityId eventId question answer").sort({ createdAt: 1 }).lean(),
      SiteContent.findOne({ key: "public" }).lean(),
    ]);
    res.setHeader("Cache-Control", "public, max-age=60");
    const publishedTargets = {
      events: new Set(events.map((item) => String(item._id))),
      opportunities: new Set(opportunities.map((item) => String(item._id))),
      resources: new Set(resources.map((item) => String(item._id))),
    };
    const publicFaqs = faqs.filter((faq) => {
      const section = faq.section || "events";
      const entityId = faq.entityId || faq.eventId;
      return publishedTargets[section]?.has(String(entityId));
    }).map((faq) => ({ ...faq, section: faq.section || "events", entityId: faq.entityId || faq.eventId }));
    res.json({ events, opportunities, resources, gallery: gallery.filter((item) => item.eventId), faqs: publicFaqs, reviews, siteContent: publicSiteValues(settings?.values) });
  } catch (error) {
    console.error("Public content could not be loaded:", error.message);
    res.status(503).json({ error: "Public content is temporarily unavailable." });
  }
});

export default router;
