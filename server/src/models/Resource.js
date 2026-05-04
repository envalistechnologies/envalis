import mongoose from "mongoose";
import slugify from "slugify";

const resourceSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true },
        description: { type: String, required: true },
        content: { type: String },
        type: {
            type: String,
            enum: ["ebook", "whitepaper", "guide", "template", "checklist", "infographic", "video", "webinar", "tool", "other"],
            required: true,
        },
        category: {
            type: String,
            enum: ["technology", "business", "design", "marketing", "development", "leadership", "productivity", "other"],
            required: true,
        },
        tags: [String],
        coverImage: { url: String, publicId: String, alt: String },
        file: { url: String, publicId: String, name: String, size: Number, format: String },
        externalUrl: { type: String },
        isFree: { type: Boolean, default: true },
        requiresEmail: { type: Boolean, default: false },
        status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
        isFeatured: { type: Boolean, default: false },
        publishedAt: { type: Date },
        views: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 },
        order: { type: Number, default: 0 },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

resourceSchema.pre("save", async function () {
    if (this.isModified("title")) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    if (this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
});

resourceSchema.index({ status: 1, type: 1 });

export default mongoose.model("Resource", resourceSchema);