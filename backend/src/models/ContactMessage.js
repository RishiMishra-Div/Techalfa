import mongoose from "mongoose";

const schema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true, maxlength: 64 },
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 30, default: "" },
  organization: { type: String, trim: true, maxlength: 160, default: "" },
  enquiryType: { type: String, required: true, enum: ["General enquiry", "Event", "Opportunity", "Partnership", "Sponsorship", "College collaboration", "Workshop / speaker", "Volunteering", "Media / PR", "Other", "Event participation", "Media"] },
  subject: { type: String, required: true, minlength: 2, maxlength: 160 },
  message: { type: String, required: true, minlength: 2, maxlength: 2000 },
  consent: { type: Boolean, required: true, validate: (v) => v === true },
  read: { type: Boolean, default: false, required: true },
  emailStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending", required: true },
}, { timestamps: true, collection: "contact_messages", versionKey: false });

export default mongoose.models.ContactMessage || mongoose.model("ContactMessage", schema);
