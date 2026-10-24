import mongoose from "mongoose";

const schema = new mongoose.Schema({
  // eventId keeps older event FAQ records readable; new FAQs use section/entityId.
  section: { type: String, enum: ["events", "opportunities", "resources"], default: "events", index: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", index: true },
  question: { type: String, required: true, trim: true, minlength: 5, maxlength: 240 },
  answer: { type: String, required: true, trim: true, minlength: 2, maxlength: 4000 },
}, { timestamps: true, versionKey: false });

export default mongoose.models.EventFaq || mongoose.model("EventFaq", schema);
