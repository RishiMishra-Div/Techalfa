import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  cat: { type: String, enum: ["Internships", "Workshops", "Campus Ambassador", "Volunteer Opportunities", "College Chapters", "Open Positions"], required: true },
  org: { type: String, required: true, trim: true, maxlength: 160 },
  thumbnailUrl: { type: String, trim: true, maxlength: 300, match: /^(?:|\/api\/media\/[a-f\d]{24})$/i, default: "" },
  pageLayout: { type: String, enum: ["feature", "editorial", "showcase"], default: "feature" },
  pageContent: { type: mongoose.Schema.Types.Mixed, default: () => ({ type: "doc", content: [{ type: "paragraph" }] }) },
  deadline: { type: String, required: true, maxlength: 30 },
  status: { type: String, enum: ["Draft", "Live", "Closed"], default: "Draft", required: true },
}, { timestamps: true, versionKey: false });

export default mongoose.models.Opportunity || mongoose.model("Opportunity", schema);
