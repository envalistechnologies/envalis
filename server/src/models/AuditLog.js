import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            enum: [
                "CREATE", "READ", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "LOGIN_FAILED",
                "PASSWORD_CHANGE", "PASSWORD_RESET", "TWO_FA_ENABLED", "TWO_FA_DISABLED",
                "ROLE_CHANGE", "PERMISSION_CHANGE", "ADMIN_CREATED", "ADMIN_DELETED",
                "EMPLOYEE_CREATED", "EMPLOYEE_UPDATED", "EMPLOYEE_DELETED",
                "EMAIL_SENT", "BULK_EMAIL_SENT", "TEMPLATE_CREATED", "TEMPLATE_UPDATED",
                "FILE_UPLOADED", "FILE_DELETED",
                "PUBLISH", "UNPUBLISH", "ARCHIVE", "RESTORE",
                "EXPORT", "IMPORT", "SETTINGS_CHANGED",
                "APPLICATION_STATUS_CHANGED", "APPLICATION_REVIEWED",
            ],
        },
        entity: {
            type: String,
            required: true,
            enum: [
                "Admin", "Employee", "Blog", "Article", "Portfolio", "CaseStudy",
                "Testimonial", "Service", "Project", "Career", "Contact",
                "Resource", "EmailLog", "EmailTemplate", "System",
            ],
        },
        entityId: { type: mongoose.Schema.Types.ObjectId },
        entityName: { type: String },
        performedBy: {
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
            adminName: String,
            adminEmail: String,
            adminRole: String,
        },
        description: { type: String, required: true },
        changes: {
            before: { type: mongoose.Schema.Types.Mixed },
            after: { type: mongoose.Schema.Types.Mixed },
        },
        metadata: {
            ip: String,
            userAgent: String,
            device: String,
            browser: String,
            os: String,
            location: String,
        },
        status: { type: String, enum: ["success", "failure", "warning"], default: "success" },
        severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
        errorMessage: { type: String },
    },
    { timestamps: true }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ "performedBy.adminId": 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);