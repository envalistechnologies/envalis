import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
    {
        clientName: { type: String, required: true, trim: true },
        clientDesignation: { type: String, required: true },
        clientCompany: { type: String, required: true },
        clientAvatar: { url: String, publicId: String },
        clientWebsite: { type: String },
        clientLocation: { type: String },
        rating: { type: Number, required: true, min: 1, max: 5 },
        quote: { type: String, required: true, maxlength: 1000 },
        shortQuote: { type: String, maxlength: 200 },
        category: {
            type: String,
            enum: ["general", "web_development", "mobile_app", "design", "consulting", "support", "other"],
            default: "general",
        },
        projectReference: { type: mongoose.Schema.Types.ObjectId, ref: "Portfolio" },
        caseStudyReference: { type: mongoose.Schema.Types.ObjectId, ref: "CaseStudy" },
        isVerified: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        isTopRated: { type: Boolean, default: false },
        status: { type: String, enum: ["pending", "approved", "rejected", "archived"], default: "pending" },
        source: { type: String, enum: ["direct", "google", "linkedin", "clutch", "goodfirms", "other"], default: "direct" },
        sourceUrl: { type: String },
        videoTestimonial: { url: String, publicId: String, thumbnail: String },
        order: { type: Number, default: 0 },
        tags: [String],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

testimonialSchema.index({ status: 1, isFeatured: -1, rating: -1 });

export default mongoose.model("Testimonial", testimonialSchema);