import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  category: { type: String, enum: ["Student Resources", "Technology Articles", "AI & Data Science", "Career Guidance", "Event Updates"], required: true },
  summary: { type: String, required: true, trim: true, minlength: 2, maxlength: 500 },
  body: { type: String, trim: true, maxlength: 12000, default: "" },
  pageLayout: { type: String, enum: ["feature", "editorial", "showcase"], default: "editorial" },
  pageContent: { type: mongoose.Schema.Types.Mixed, default: () => ({ type: "doc", content: [{ type: "paragraph" }] }) },
  status: { type: String, enum: ["Draft", "Live"], default: "Draft", required: true },
  thumbnailUrl: { type: String, trim: true, maxlength: 300, match: /^(?:|\/api\/media\/[a-f\d]{24})$/i, default: "" },
}, { timestamps: true, versionKey: false });

export default mongoose.models.Resource || mongoose.model("Resource", schema);
