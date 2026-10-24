import mongoose from "mongoose";

const schema = new mongoose.Schema({
  key: { type: String, enum: ["public"], default: "public", unique: true },
  values: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true, versionKey: false });

export default mongoose.models.SiteContent || mongoose.model("SiteContent", schema);
