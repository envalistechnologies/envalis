import mongoose from "mongoose";
import slugify from "slugify";

const caseStudySchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true },
        tagline: { type: String },
        overview: { type: String, required: true },
        coverImage: { url: String, publicId: String, alt: String },
        bannerImage: { url: String, publicId: String, alt: String },
        gallery: [{ url: String, publicId: String, alt: String, caption: String }],
        client: {
            name: { type: String, required: true },
            logo: { url: String, publicId: String },
            industry: String,
            size: String,
            location: String,
            website: String,
        },
        category: {
            type: String,
            enum: ["digital_transformation", "product_development", "process_improvement", "cost_reduction", "growth", "other"],
            required: true,
        },
        tags: [String],
        services: [String],
        technologies: [String],

        // Detailed sections
        background: { type: String },
        challenge: {
            description: String,
            points: [String],
        },
        solution: {
            description: String,
            points: [String],
            approach: String,
        },
        implementation: {
            phases: [
                {
                    name: String,
                    duration: String,
                    description: String,
                    deliverables: [String],
                },
            ],
        },
        results: {
            summary: String,
            metrics: [
                {
                    label: String,
                    value: String,
                    unit: String,
                    improvement: String,
                },
            ],
        },
        testimonial: {
            quote: String,
            author: String,
            designation: String,
            company: String,
            avatar: { url: String, publicId: String },
        },
        timeline: { type: String },
        teamSize: { type: Number },
        projectValue: { type: String },
        completionDate: { type: Date },

        // Meta
        isFeatured: { type: Boolean, default: false },
        status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
        publishedAt: { type: Date },
        views: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 },
        order: { type: Number, default: 0 },
        relatedCaseStudies: [{ type: mongoose.Schema.Types.ObjectId, ref: "CaseStudy" }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

caseStudySchema.pre("save", async function () {
    if (this.isModified("title")) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    if (this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
});

caseStudySchema.index({ status: 1, isFeatured: -1 });

export default mongoose.model("CaseStudy", caseStudySchema);