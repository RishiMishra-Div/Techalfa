import mongoose from "mongoose";

const schema = new mongoose.Schema({
  contentType: { type: String, enum: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"], required: true },
  data: { type: Buffer, required: true },
  uploadedBy: { type: String, required: true, maxlength: 254 },
}, { timestamps: true, versionKey: false });

export default mongoose.models.MediaAsset || mongoose.model("MediaAsset", schema);
