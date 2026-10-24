import mongoose from "mongoose";

const communityRegistrationSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, maxlength: 64 },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    college: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    studyYear: { type: String, required: true, enum: ["1st year", "2nd year", "3rd year", "4th year", "Postgraduate", "Other"] },
    interests: { type: String, required: true, enum: ["Events and hackathons", "Workshops and learning", "Campus leadership", "Volunteering and operations", "Projects and open source", "Other"] },
    message: { type: String, trim: true, maxlength: 1200, default: "" },
    consent: { type: Boolean, required: true, validate: (value) => value === true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending", required: true },
    emailStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending", required: true },
  },
  { timestamps: true, collection: "community_registrations", versionKey: false },
);

communityRegistrationSchema.index({ createdAt: -1 });

export default mongoose.models.CommunityRegistration || mongoose.model("CommunityRegistration", communityRegistrationSchema);
