import { createAuditLog } from "../services/auditService.js";

export const requestLogger = (req, res, next) => {
    req.requestTime = new Date().toISOString();
    req.ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    req.userAgent = req.headers["user-agent"] || "Unknown";
    try {
        const origin = req.headers.origin || req.headers.referer || "<none>";
        console.log(`[req] ${req.method} ${req.path} origin=${origin} ip=${req.ipAddress}`);
    } catch (err) {
        console.log("[req] requestLogger error", err?.message || err);
    }
    next();
};

export const auditMiddleware = (action, entity, getEntityInfo) => {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);
        res.json = async (data) => {
            if (data?.success !== false && req.admin) {
                try {
                    const entityInfo = getEntityInfo ? getEntityInfo(req, data) : {};
                    await createAuditLog({
                        action,
                        entity,
                        entityId: entityInfo.id,
                        entityName: entityInfo.name,
                        performedBy: req.admin,
                        description: entityInfo.description || `${action} ${entity}`,
                        metadata: {
                            ip: req.ipAddress,
                            userAgent: req.userAgent,
                        },
                        status: "success",
                    });
                } catch (err) {
                    console.error("Audit log error:", err.message);
                }
            }
            return originalJson(data);
        };
        next();
    };
};