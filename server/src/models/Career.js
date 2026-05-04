import mongoose from "mongoose";
import slugify from "slugify";

const careerSchema = new mongoose.Schema(
    {
        jobId: { type: String, unique: true },
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true },
        department: {
            type: String,
            enum: ["engineering", "design", "marketing", "hr", "finance", "operations", "sales", "management", "other"],
            required: true,
        },
        type: {
            type: String,
            enum: ["full_time", "part_time", "contract", "internship", "remote", "hybrid"],
            required: true,
        },
        location: { type: String, required: true },
        isRemote: { type: Boolean, default: false },
        experience: {
            min: { type: Number, required: true },
            max: { type: Number },
            level: { type: String, enum: ["entry", "junior", "mid", "senior", "lead", "principal", "executive"] },
        },
        salary: {
            min: Number,
            max: Number,
            currency: { type: String, default: "INR" },
            isVisible: { type: Boolean, default: false },
        },
        description: { type: String, required: true },
        responsibilities: [String],
        requirements: [String],
        niceToHave: [String],
        skills: [String],
        benefits: [String],
        perks: [String],
        applicationDeadline: { type: Date },
        openings: { type: Number, default: 1 },
        status: { type: String, enum: ["draft", "active", "paused", "closed", "filled"], default: "draft" },
        isFeatured: { type: Boolean, default: false },
        isUrgent: { type: Boolean, default: false },
        views: { type: Number, default: 0 },
        applications: [
            {
                applicantName: String,
                applicantEmail: String,
                applicantPhone: String,
                resumeUrl: String,
                resumePublicId: String,
                coverLetter: String,
                linkedinUrl: String,
                portfolioUrl: String,
                appliedAt: { type: Date, default: Date.now },
                status: {
                    type: String,
                    enum: ["pending", "reviewing", "shortlisted", "interview", "selected", "rejected", "withdrawn"],
                    default: "pending",
                },
                notes: String,
                reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
                reviewedAt: Date,
                interviewDate: Date,
                interviewNotes: String,
            },
        ],
        tags: [String],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

careerSchema.pre("save", async function () {
    if (!this.jobId) {
        const count = await mongoose.model("Career").countDocuments();
        this.jobId = `JOB${String(count + 1).padStart(4, "0")}`;
    }
    if (this.isModified("title")) {
        this.slug = slugify(`${this.title}-${this.jobId}`, { lower: true, strict: true });
    }
});

careerSchema.index({ status: 1, isFeatured: -1 });
careerSchema.index({ department: 1, status: 1 });

export default mongoose.model("Career", careerSchema);