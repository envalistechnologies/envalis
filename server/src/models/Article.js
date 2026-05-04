import mongoose from "mongoose";
import slugify from "slugify";

const articleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        slug: { type: String, unique: true },
        subtitle: { type: String, maxlength: 300 },
        excerpt: { type: String, required: true, maxlength: 500 },
        content: { type: String, required: true },
        coverImage: { url: String, publicId: String, alt: String },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
        coAuthors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Admin" }],
        category: {
            type: String,
            enum: ["whitepaper", "research", "thought_leadership", "industry_report", "case_analysis", "opinion", "guide", "other"],
            required: true,
        },
        tags: [{ type: String, trim: true }],
        status: { type: String, enum: ["draft", "published", "archived", "scheduled"], default: "draft" },
        publishedAt: { type: Date },
        scheduledAt: { type: Date },
        isFeatured: { type: Boolean, default: false },
        isPremium: { type: Boolean, default: false },
        readTime: { type: Number },
        views: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 },
        attachments: [
            {
                name: String,
                url: String,
                publicId: String,
                fileType: String,
                fileSize: Number,
            },
        ],
        tableOfContents: [{ id: String, title: String, level: Number }],
        references: [{ title: String, url: String, author: String }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

articleSchema.pre("save", async function () {
    if (this.isModified("title")) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    if (this.content) {
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / 200);
    }
    if (this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
});

articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1 });

export default mongoose.model("Article", articleSchema);