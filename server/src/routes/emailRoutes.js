import express from "express";
import { sendDirectEmail, sendBulkEmailToEmployees, sendTemplateEmail, getEmailLogs, getEmailLogById, getEmailStats, getAllTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate, previewTemplate } from "../controllers/emailController.js";
import { protect, checkPermission, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

// Sending
router.post("/send", checkPermission("emails", "send"), sendDirectEmail);
router.post("/send-bulk", checkPermission("emails", "send"), sendBulkEmailToEmployees);
router.post("/send-template", checkPermission("emails", "send"), sendTemplateEmail);

// Logs
router.get("/logs", authorize("super_admin", "admin", "hr"), getEmailLogs);
router.get("/logs/stats", authorize("super_admin", "admin", "hr"), getEmailStats);
router.get("/logs/:id", authorize("super_admin", "admin", "hr"), getEmailLogById);

// Templates
router.get("/templates", getAllTemplates);
router.get("/templates/:id", getTemplateById);
router.post("/templates/:id/preview", previewTemplate);
router.post("/templates", authorize("super_admin", "admin"), createTemplate);
router.put("/templates/:id", authorize("super_admin", "admin"), updateTemplate);
router.delete("/templates/:id", authorize("super_admin", "admin"), deleteTemplate);

export default router;