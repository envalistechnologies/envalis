import AuditLog from "../models/AuditLog.js";

const AUDIT_LOG_RETENTION_LIMIT = 300;

const pruneOldAuditLogs = async () => {
    const count = await AuditLog.countDocuments();
    if (count <= AUDIT_LOG_RETENTION_LIMIT) return;

    const oldLogIds = await AuditLog.find({})
        .sort({ createdAt: -1, _id: -1 })
        .skip(AUDIT_LOG_RETENTION_LIMIT)
        .select("_id");

    if (!oldLogIds.length) return;

    await AuditLog.deleteMany({ _id: { $in: oldLogIds.map((log) => log._id) } });
};

export const createAuditLog = async ({
    action,
    entity,
    entityId,
    entityName,
    performedBy,
    description,
    changes,
    metadata,
    status = "success",
    severity = "low",
    errorMessage,
}) => {
    try {
        const log = await AuditLog.create({
            action,
            entity,
            entityId,
            entityName,
            performedBy: performedBy
                ? {
                    adminId: performedBy._id,
                    adminName: `${performedBy.firstName} ${performedBy.lastName}`,
                    adminEmail: performedBy.email,
                    adminRole: performedBy.role,
                }
                : undefined,
            description,
            changes,
            metadata,
            status,
            severity,
            errorMessage,
        });
        await pruneOldAuditLogs();
        return log;
    } catch (error) {
        console.error("Failed to create audit log:", error.message);
    }
};

export const getAuditLogs = async ({
    page = 1,
    limit = 20,
    action,
    entity,
    adminId,
    startDate,
    endDate,
    status,
    severity,
    search,
}) => {
    const query = {};

    if (action) query.action = action;
    if (entity) query.entity = entity;
    if (adminId) query["performedBy.adminId"] = adminId;
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
        query.$or = [
            { description: { $regex: search, $options: "i" } },
            { "performedBy.adminName": { $regex: search, $options: "i" } },
            { "performedBy.adminEmail": { $regex: search, $options: "i" } },
            { entityName: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
        AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        AuditLog.countDocuments(query),
    ]);

    return {
        logs,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            limit: Number(limit),
        },
    };
};