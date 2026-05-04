import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        employeeId: { type: String, unique: true },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        personalEmail: { type: String, lowercase: true },
        phone: { type: String },
        alternatePhone: { type: String },
        avatar: { url: String, publicId: String },
        dateOfBirth: { type: Date },
        gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },

        // Job Info
        department: {
            type: String,
            enum: ["engineering", "design", "marketing", "hr", "finance", "operations", "sales", "management", "other"],
            required: true,
        },
        designation: { type: String, required: true },
        employmentType: { type: String, enum: ["full_time", "part_time", "contract", "intern"], default: "full_time" },
        joiningDate: { type: Date, required: true },
        probationEndDate: { type: Date },
        confirmationDate: { type: Date },
        exitDate: { type: Date },
        isActive: { type: Boolean, default: true },
        status: { type: String, enum: ["active", "on_leave", "resigned", "terminated", "retired"], default: "active" },

        // Address
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            pincode: String,
        },

        // Emergency Contact
        emergencyContact: {
            name: String,
            relation: String,
            phone: String,
        },

        // Documents
        documents: [
            {
                name: String,
                type: String,
                url: String,
                publicId: String,
                uploadedAt: { type: Date, default: Date.now },
            },
        ],

        // Salary
        salary: {
            basic: Number,
            hra: Number,
            allowances: Number,
            deductions: Number,
            currency: { type: String, default: "INR" },
        },

        // Skills & Education
        skills: [String],
        education: [
            {
                degree: String,
                institution: String,
                year: Number,
                grade: String,
            },
        ],

        // Leave
        leaveBalance: {
            casual: { type: Number, default: 12 },
            sick: { type: Number, default: 10 },
            earned: { type: Number, default: 15 },
            maternity: { type: Number, default: 180 },
            paternity: { type: Number, default: 15 },
        },

        notes: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

// Auto generate employee ID
employeeSchema.pre("save", async function () {
    if (!this.employeeId) {
        const count = await mongoose.model("Employee").countDocuments();
        this.employeeId = `EMP${String(count + 1).padStart(4, "0")}`;
    }
});

employeeSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model("Employee", employeeSchema);