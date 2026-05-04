import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
    {
        subject: { type: String, required: true },
        from: { type: String, required: true },
        to: [{ type: String, required: true }],
        cc: [String],
        bcc: [String],
        body: { type: String },
        template: { type: mongoose.Schema.Types.ObjectId, ref: "EmailTemplate" },
        templateName: { type: String },
        category: {
            type: String,
            enum: ["welcome", "announcement", "newsletter", "hr_notice", "policy", "event", "recognition", "reminder", "other"],
            default: "other",
        },
        type: { type: String, enum: ["individual", "bulk", "group"], default: "individual" },
        status: { type: String, enum: ["sent", "failed", "queued", "delivered", "bounced"], default: "queued" },
        sentAt: { type: Date },
        deliveredAt: { type: Date },
        failedReason: { type: String },
        attachments: [{ name: String, url: String }],
        recipientCount: { type: Number, default: 1 },
        sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        sentByName: { type: String },
        tags: [String],
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

emailLogSchema.index({ sentBy: 1, createdAt: -1 });
emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ category: 1 });

export default mongoose.model("EmailLog", emailLogSchema);