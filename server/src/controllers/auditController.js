import AuditLog from "../models/AuditLog.js";
import { getAuditLogs as fetchAuditLogs } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, paginatedResponse } from "../utils/apiResponse.js";

export const getAuditLogsController = asyncHandler(async (req, res) => {
    const { page, limit } = buildPaginationQuery(req.query);
    const result = await fetchAuditLogs({ ...req.query, page, limit });
    paginatedResponse(res, { logs: result.logs }, result.pagination);
});

export const getAuditLogById = asyncHandler(async (req, res) => {
    const log = await AuditLog.findById(req.params.id);
    if (!log) return errorResponse(res, "Audit log not found", 404);
    successResponse(res, { log });
});

export const getAuditStats = asyncHandler(async (req, res) => {
    const [total, byAction, byEntity, bySeverity, byStatus] = await Promise.all([
        AuditLog.countDocuments(),
        AuditLog.aggregate([{ $group: { _id: "$action", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
        AuditLog.aggregate([{ $group: { _id: "$entity", count: { $sum: 1 } } }]),
        AuditLog.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
        AuditLog.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);
    successResponse(res, { stats: { total, byAction, byEntity, bySeverity, byStatus } });
});
