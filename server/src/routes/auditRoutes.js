// auditRoutes.js
import express from "express";
import { getAuditLogsController, getAuditLogById, getAuditStats } from "../controllers/auditController.js";
import { protect, checkPermission, authorize } from "../middleware/authMiddleware.js";
const auditRouter = express.Router();
auditRouter.use(protect);
auditRouter.get("/stats", authorize("super_admin", "admin"), getAuditStats);
auditRouter.get("/", checkPermission("auditLogs", "read"), getAuditLogsController);
auditRouter.get("/:id", checkPermission("auditLogs", "read"), getAuditLogById);
export { auditRouter as default };