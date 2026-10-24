import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  college: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  authVersion: { type: Number, default: 0, select: false },
  headline: { type: String, trim: true, maxlength: 120, default: "" },
  year: { type: String, trim: true, maxlength: 40, default: "" },
  city: { type: String, trim: true, maxlength: 100, default: "" },
  skills: { type: [String], default: [] },
  github: { type: String, trim: true, maxlength: 200, default: "" },
  linkedin: { type: String, trim: true, maxlength: 200, default: "" },
  avatarUrl: { type: String, trim: true, maxlength: 100, default: "" },
  confirmationEmailStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
}, { timestamps: true, versionKey: false });

export default mongoose.models.Student || mongoose.model("Student", schema);
