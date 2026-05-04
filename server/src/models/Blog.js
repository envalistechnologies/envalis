import mongoose from "mongoose";
import slugify from "slugify";

const blogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        slug: { type: String, unique: true },
        excerpt: { type: String, required: true, maxlength: 500 },
        content: { type: String, required: true },
        coverImage: { url: String, publicId: String, alt: String },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
        category: {
            type: String,
            enum: ["technology", "design", "business", "marketing", "development", "news", "tutorial", "insights", "other"],
            required: true,
        },
        tags: [{ type: String, trim: true }],
        status: { type: String, enum: ["draft", "published", "archived", "scheduled"], default: "draft" },
        publishedAt: { type: Date },
        scheduledAt: { type: Date },
        isFeatured: { type: Boolean, default: false },
        isTopPick: { type: Boolean, default: false },
        readTime: { type: Number },
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        gallery: [{ url: String, publicId: String, alt: String }],
        relatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

blogSchema.pre("save", async function () {
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

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

export default mongoose.model("Blog", blogSchema);