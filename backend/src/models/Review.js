import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  college: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  course: { type: String, trim: true, maxlength: 100, default: "" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true, trim: true, minlength: 10, maxlength: 1200 },
  imageUrl: { type: String, trim: true, maxlength: 300, match: /^(?:|\/api\/media\/[a-f\d]{24})$/i, default: "" },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending", required: true },
  consent: { type: Boolean, required: true, validate: (value) => value === true },
}, { timestamps: true, versionKey: false });

schema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model("Review", schema);
