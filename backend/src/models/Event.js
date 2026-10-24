import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  date: { type: String, required: true, maxlength: 30 },
  time: { type: String, trim: true, maxlength: 10, default: "" },
  type: { type: String, enum: ["Hackathon", "Workshop", "Guest Lecture", "Tech Fest"], required: true },
  place: { type: String, required: true, trim: true, maxlength: 160 },
  importantInfo: { type: String, trim: true, maxlength: 1000, default: "" },
  countdownEnabled: { type: Boolean, default: false },
  registrationUrl: { type: String, trim: true, maxlength: 500, match: /^(?:|https?:\/\/[^\s]+)$/i, default: "" },
  thumbnailUrl: { type: String, trim: true, maxlength: 300, match: /^(?:|\/api\/media\/[a-f\d]{24})$/i, default: "" },
  pageLayout: { type: String, enum: ["feature", "editorial", "showcase"], default: "feature" },
  pageContent: { type: mongoose.Schema.Types.Mixed, default: () => ({ type: "doc", content: [{ type: "paragraph" }] }) },
  status: { type: String, enum: ["Draft", "Open", "Closed", "Completed"], default: "Draft", required: true },
}, { timestamps: true, versionKey: false });

export default mongoose.models.Event || mongoose.model("Event", schema);
