import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true },
        phone: { type: String },
        company: { type: String },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        service: { type: String },
        budget: { type: String },
        timeline: { type: String },
        source: { type: String, enum: ["website", "referral", "social_media", "google", "linkedin", "other"], default: "website" },
        status: {
            type: String,
            enum: ["new", "read", "in_progress", "replied", "closed", "spam"],
            default: "new",
        },
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        notes: [
            {
                content: String,
                addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
                addedAt: { type: Date, default: Date.now },
            },
        ],
        ipAddress: { type: String },
        userAgent: { type: String },
        location: { type: String },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date },
        readBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        repliedAt: { type: Date },
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

export default mongoose.model("Contact", contactSchema);