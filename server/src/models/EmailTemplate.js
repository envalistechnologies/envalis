import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    subject: { type: String, required: true },
    description: { type: String },
    htmlContent: { type: String, required: true },
    textContent: { type: String },
    category: {
      type: String,
      enum: ["welcome", "announcement", "newsletter", "hr_notice", "policy", "event", "recognition", "reminder", "other"],
      required: true,
    },
    variables: [
      {
        key: String,
        label: String,
        description: String,
        defaultValue: String,
        required: { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
    previewImage: { url: String, publicId: String },
    tags: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("EmailTemplate", emailTemplateSchema);