import mongoose from "mongoose";
import slugify from "slugify";

const portfolioSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true },
        description: { type: String, required: true },
        shortDescription: { type: String, maxlength: 300 },
        client: {
            name: String,
            logo: { url: String, publicId: String },
            website: String,
            industry: String,
        },
        coverImage: { url: String, publicId: String, alt: String },
        gallery: [{ url: String, publicId: String, alt: String, caption: String }],
        category: {
            type: String,
            enum: ["web_development", "mobile_app", "ui_ux", "branding", "ecommerce", "saas", "enterprise", "other"],
            required: true,
        },
        tags: [String],
        technologies: [String],
        services: [String],
        challenge: { type: String },
        solution: { type: String },
        results: [{ metric: String, value: String, description: String }],
        testimonial: {
            quote: String,
            author: String,
            designation: String,
            avatar: String,
        },
        projectUrl: { type: String },
        githubUrl: { type: String },
        duration: { type: String },
        teamSize: { type: Number },
        completionDate: { type: Date },
        isFeatured: { type: Boolean, default: false },
        status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
        views: { type: Number, default: 0 },
        order: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

portfolioSchema.pre("save", async function () {
    if (this.isModified("title")) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
});

portfolioSchema.index({ status: 1, isFeatured: -1 });
portfolioSchema.index({ category: 1 });

export default mongoose.model("Portfolio", portfolioSchema);