import mongoose from "mongoose";
import slugify from "slugify";

const serviceSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        slug: { type: String, unique: true },
        tagline: { type: String },
        shortDescription: { type: String, maxlength: 300 },
        excerpt: { type: String, required: true, maxlength: 500 },
        description: { type: String },
        content: { type: String, required: true },
        coverImage: { url: String, publicId: String, alt: String },
        bannerImage: { url: String, publicId: String, alt: String },
        category: {
            type: String,
            enum: ["development", "design", "marketing", "consulting", "support", "training", "analytics", "automation", "other"],
            required: true,
        },
        features: [{ title: String, description: String }],
        pricing: [{ plan: String, price: String, period: String, features: [String], isPopular: Boolean }],
        process: [{ step: Number, title: String, description: String }],
        faqs: [{ question: String, answer: String }],
        technologies: [String],
        tags: [{ type: String, trim: true }],
        status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
        publishedAt: { type: Date },
        isFeatured: { type: Boolean, default: false },
        isTopPick: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

serviceSchema.pre("save", async function () {
    if (this.isModified("title")) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    if (this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
});

serviceSchema.index({ status: 1, createdAt: -1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ tags: 1 });

export default mongoose.model("Service", serviceSchema);