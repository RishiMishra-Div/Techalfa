import mongoose from "mongoose";

const schema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  registrationCode: { type: String, required: true, unique: true, index: true },
  emailStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
}, { timestamps: true, versionKey: false });
schema.index({ studentId: 1, eventId: 1 }, { unique: true });

export default mongoose.models.StudentEventRegistration || mongoose.model("StudentEventRegistration", schema);
