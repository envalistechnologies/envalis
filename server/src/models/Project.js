import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        projectId: { type: String, unique: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        client: { type: String, required: true },
        clientContact: {
            name: String,
            email: String,
            phone: String,
        },
        category: {
            type: String,
            enum: ["web_development", "mobile_app", "ui_ux", "branding", "ecommerce", "saas", "enterprise", "consulting", "other"],
            required: true,
        },
        status: {
            type: String,
            enum: ["planning", "in_progress", "review", "on_hold", "completed", "cancelled", "delivered"],
            default: "planning",
        },
        priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
        startDate: { type: Date, required: true },
        estimatedEndDate: { type: Date },
        actualEndDate: { type: Date },
        budget: {
            estimated: Number,
            actual: Number,
            currency: { type: String, default: "INR" },
        },
        teamMembers: [
            {
                employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
                role: String,
                joinedAt: { type: Date, default: Date.now },
                leftAt: Date,
            },
        ],
        projectManager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        technologies: [String],
        milestones: [
            {
                title: String,
                description: String,
                dueDate: Date,
                completedDate: Date,
                status: { type: String, enum: ["pending", "in_progress", "completed", "delayed"], default: "pending" },
            },
        ],
        tasks: [
            {
                title: String,
                description: String,
                assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
                status: { type: String, enum: ["todo", "in_progress", "review", "done"], default: "todo" },
                priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
                dueDate: Date,
                completedDate: Date,
                estimatedHours: Number,
                loggedHours: Number,
            },
        ],
        documents: [
            {
                name: String,
                url: String,
                publicId: String,
                uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
        progress: { type: Number, default: 0, min: 0, max: 100 },
        notes: [
            {
                content: String,
                addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
                addedAt: { type: Date, default: Date.now },
            },
        ],
        tags: [String],
        isPublic: { type: Boolean, default: false },
        portfolioRef: { type: mongoose.Schema.Types.ObjectId, ref: "Portfolio" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

projectSchema.pre("save", async function () {
    if (!this.projectId) {
        const count = await mongoose.model("Project").countDocuments();
        this.projectId = `PRJ${String(count + 1).padStart(4, "0")}`;
    }
});

export default mongoose.model("Project", projectSchema);