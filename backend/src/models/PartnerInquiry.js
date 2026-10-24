import mongoose from "mongoose";

const schema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true, maxlength: 64 },
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  organization: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  partnershipType: { type: String, required: true, enum: ["Event sponsorship", "Workshop or speaker", "Campus collaboration", "Hiring and opportunities", "Media partnership", "Other"] },
  message: { type: String, required: true, minlength: 2, maxlength: 2000 },
  consent: { type: Boolean, required: true, validate: (v) => v === true },
  read: { type: Boolean, default: false, required: true },
  emailStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending", required: true },
}, { timestamps: true, collection: "partner_inquiries", versionKey: false });

export default mongoose.models.PartnerInquiry || mongoose.model("PartnerInquiry", schema);
