import mongoose from "mongoose";

const schema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  url: { type: String, required: true, match: /^\/api\/media\/[a-f\d]{24}$/i },
  mediaType: { type: String, enum: ["image", "video"], required: true },
  caption: { type: String, trim: true, maxlength: 180, default: "" },
  uploadedBy: { type: String, required: true, maxlength: 254 },
}, { timestamps: true, versionKey: false });

export default mongoose.models.GalleryMedia || mongoose.model("GalleryMedia", schema);
