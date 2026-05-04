import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const adminSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 8, select: false },
        role: {
            type: String,
            enum: ["super_admin", "admin", "hr", "manager", "editor", "viewer"],
            default: "admin",
        },
        avatar: { url: String, publicId: String },
        phone: { type: String },
        department: { type: String },
        isActive: { type: Boolean, default: true },
        isSuperAdmin: { type: Boolean, default: false },

        // 2FA
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorSecret: { type: String, select: false },
        twoFactorBackupCodes: { type: [String], select: false },

        // Security
        loginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date },
        lastLogin: { type: Date },
        lastLoginIP: { type: String },
        lastLoginDevice: { type: String },
        activeSessions: [
            {
                token: String,
                ip: String,
                device: String,
                createdAt: { type: Date, default: Date.now },
                expiresAt: Date,
            },
        ],

        // Password Reset
        passwordResetToken: { type: String, select: false },
        passwordResetExpires: { type: Date, select: false },
        passwordChangedAt: { type: Date },

        // Permissions
        permissions: {
            blogs: { create: Boolean, read: Boolean, update: Boolean, delete: Boolean },
            articles: { create: Boolean, read: Boolean, update: Boolean, delete: Boolean },
            portfolios: { create: Boolean, read: Boolean, update: Boolean, delete: Boolean },
            caseStudies: { create: Boolean, read: Boolean, update: Boolean, delete: Boolean },
            testimonials: { create: Boolean, read: Boolean, update: Boolean, delete: Boolean },
            employees: { create: Boolean, read: Boolean, update: Boolean, delete: Boolean },
            projects: { create: Boolean, read: Boolean, update: Boolean, delete: Boolean },
            careers: { create: Boolean, read: Boolean, update: Boolean, delete: Boolean },
            emails: { send: Boolean },
            services: { create: Boolean, read: Boolean, update: Boolean, delete: Boolean },
            resources: { create: Boolean, read: Boolean, update: Boolean, delete: Boolean },
            contacts: { read: Boolean, delete: Boolean },
            auditLogs: { read: Boolean },
        },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        deletedAt: { type: Date },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Virtual full name
adminSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Account lock
adminSchema.virtual("isLocked").get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before save
adminSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = Date.now() - 1000;
});

// Compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Increment login attempts
adminSchema.methods.incrementLoginAttempts = async function () {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
    }
    const updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
    }
    return this.updateOne(updates);
};

// Generate password reset token
adminSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

// Check if password changed after token issued
adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Default permissions by role
adminSchema.methods.setDefaultPermissions = function () {
    const allTrue = { create: true, read: true, update: true, delete: true };
    const readOnly = { create: false, read: true, update: false, delete: false };

    const rolePermissions = {
        super_admin: {
            blogs: allTrue, articles: allTrue, portfolios: allTrue,
            caseStudies: allTrue, testimonials: allTrue, employees: allTrue,
            projects: allTrue, careers: allTrue, emails: { send: true },
            services: allTrue, resources: allTrue,
            contacts: { read: true, delete: true }, auditLogs: { read: true },
        },
        admin: {
            blogs: allTrue, articles: allTrue, portfolios: allTrue,
            caseStudies: allTrue, testimonials: allTrue, employees: allTrue,
            projects: allTrue, careers: allTrue, emails: { send: true },
            services: allTrue, resources: allTrue,
            contacts: { read: true, delete: true }, auditLogs: { read: true },
        },
        hr: {
            blogs: readOnly, articles: readOnly, portfolios: readOnly,
            caseStudies: readOnly, testimonials: readOnly,
            employees: allTrue, projects: readOnly, careers: allTrue,
            emails: { send: true }, services: readOnly, resources: allTrue,
            contacts: { read: true, delete: false }, auditLogs: { read: false },
        },
        manager: {
            blogs: allTrue, articles: allTrue, portfolios: allTrue,
            caseStudies: allTrue, testimonials: allTrue,
            employees: { ...readOnly, update: true }, projects: allTrue,
            careers: readOnly, emails: { send: true },
            services: allTrue, resources: allTrue,
            contacts: { read: true, delete: false }, auditLogs: { read: false },
        },
        editor: {
            blogs: { ...allTrue, delete: false }, articles: { ...allTrue, delete: false },
            portfolios: { ...allTrue, delete: false }, caseStudies: { ...allTrue, delete: false },
            testimonials: readOnly, employees: readOnly, projects: readOnly,
            careers: readOnly, emails: { send: false },
            services: { ...allTrue, delete: false }, resources: { ...allTrue, delete: false },
            contacts: { read: false, delete: false }, auditLogs: { read: false },
        },
        viewer: {
            blogs: readOnly, articles: readOnly, portfolios: readOnly,
            caseStudies: readOnly, testimonials: readOnly, employees: readOnly,
            projects: readOnly, careers: readOnly, emails: { send: false },
            services: readOnly, resources: readOnly,
            contacts: { read: false, delete: false }, auditLogs: { read: false },
        },
    };
    this.permissions = rolePermissions[this.role] || rolePermissions.viewer;
};

export default mongoose.model("Admin", adminSchema);