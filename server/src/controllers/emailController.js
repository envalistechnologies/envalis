import Employee from "../models/Employee.js";
import EmailLog from "../models/EmailLog.js";
import EmailTemplate from "../models/EmailTemplate.js";
import { sendEmail, sendBulkEmail, sendEmailFromTemplate, emailAppUrls } from "../services/emailService.js";
import { createAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, paginatedResponse } from "../utils/apiResponse.js";
import { extractVariables } from "../utils/templateCompiler.js";

// ─── EMAIL SENDING ────────────────────────────────────────────────────────────
export const sendDirectEmail = asyncHandler(async (req, res) => {
  const { to, subject, html, text, cc, bcc, category } = req.body;
  if (!to || !subject || !html) return errorResponse(res, "To, subject, and html body are required", 400);
  const result = await sendEmail({ to, subject, html, text, cc, bcc, category, sentBy: req.admin });
  await createAuditLog({ action: "EMAIL_SENT", entity: "Admin", entityId: req.admin._id, entityName: req.admin.email, performedBy: req.admin, description: `Email sent to ${Array.isArray(to) ? to.join(", ") : to}` });
  successResponse(res, { logId: result.logId }, "Email sent successfully");
});

export const sendBulkEmailToEmployees = asyncHandler(async (req, res) => {
  const { department, employeeIds, subject, html, text, category, templateId, variables } = req.body;
  let employees;
  if (employeeIds?.length) {
    employees = await Employee.find({ _id: { $in: employeeIds }, isDeleted: false, isActive: true }).select("email firstName lastName");
  } else if (department) {
    employees = await Employee.find({ department, isDeleted: false, isActive: true }).select("email firstName lastName");
  } else {
    employees = await Employee.find({ isDeleted: false, isActive: true }).select("email firstName lastName");
  }
  if (!employees.length) return errorResponse(res, "No active employees found", 400);

  let result;
  if (templateId) {
    result = await sendEmailFromTemplate({ templateId, to: employees.map((e) => e.email), variables: variables || {}, sentBy: req.admin });
  } else {
    result = await sendBulkEmail({ employees, subject, html, text, category, sentBy: req.admin });
  }

  await createAuditLog({ action: "BULK_EMAIL_SENT", entity: "Admin", entityId: req.admin._id, entityName: req.admin.email, performedBy: req.admin, description: `Bulk email sent to ${employees.length} employee(s) in ${department || "all departments"}`, severity: "medium" });
  successResponse(res, { recipientCount: employees.length, logId: result.logId }, `Email sent to ${employees.length} employees`);
});

export const sendTemplateEmail = asyncHandler(async (req, res) => {
  const { templateId, to, variables, cc, bcc } = req.body;
  const result = await sendEmailFromTemplate({ templateId, to, variables, sentBy: req.admin, cc, bcc });
  await createAuditLog({ action: "EMAIL_SENT", entity: "EmailTemplate", entityId: templateId, performedBy: req.admin, description: `Template email sent to ${Array.isArray(to) ? to.join(", ") : to}` });
  successResponse(res, { logId: result.logId }, "Template email sent successfully");
});

// ─── EMAIL LOGS ───────────────────────────────────────────────────────────────
export const getEmailLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPaginationQuery(req.query);
  const { status, category, search, startDate, endDate } = req.query;
  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) query.$or = [{ subject: { $regex: search, $options: "i" } }, { to: { $regex: search, $options: "i" } }, { sentByName: { $regex: search, $options: "i" } }];
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    EmailLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("sentBy", "firstName lastName"),
    EmailLog.countDocuments(query),
  ]);
  paginatedResponse(res, { logs }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getEmailLogById = asyncHandler(async (req, res) => {
  const log = await EmailLog.findById(req.params.id).populate("sentBy", "firstName lastName email").populate("template", "name category");
  if (!log) return errorResponse(res, "Email log not found", 404);
  successResponse(res, { log });
});

export const getEmailStats = asyncHandler(async (req, res) => {
  const [total, byStatus, byCategory] = await Promise.all([
    EmailLog.countDocuments(),
    EmailLog.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    EmailLog.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);
  successResponse(res, { stats: { total, byStatus, byCategory } });
});

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────
export const getAllTemplates = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPaginationQuery(req.query);
  const { category, isActive, search } = req.query;
  const query = { isDeleted: false };
  if (category) query.category = category;
  if (isActive !== undefined) query.isActive = isActive === "true";
  if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { subject: { $regex: search, $options: "i" } }];

  const [templates, total] = await Promise.all([
    EmailTemplate.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-htmlContent -textContent"),
    EmailTemplate.countDocuments(query),
  ]);
  paginatedResponse(res, { templates }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getTemplateById = asyncHandler(async (req, res) => {
  const template = await EmailTemplate.findOne({ _id: req.params.id, isDeleted: false }).populate("createdBy", "firstName lastName");
  if (!template) return errorResponse(res, "Template not found", 404);
  successResponse(res, { template });
});

export const createTemplate = asyncHandler(async (req, res) => {
  const { name, subject, htmlContent, textContent, category, description, tags } = req.body;
  const variables = extractVariables(htmlContent);
  const variablesList = variables.map((key) => ({ key, label: key, required: false }));
  const template = await EmailTemplate.create({ name, subject, htmlContent, textContent, category, description, tags, variables: variablesList, createdBy: req.admin._id });
  await createAuditLog({ action: "TEMPLATE_CREATED", entity: "EmailTemplate", entityId: template._id, entityName: template.name, performedBy: req.admin, description: `Email template created: ${template.name}` });
  successResponse(res, { template }, "Template created successfully", 201);
});

export const updateTemplate = asyncHandler(async (req, res) => {
  const template = await EmailTemplate.findOne({ _id: req.params.id, isDeleted: false });
  if (!template) return errorResponse(res, "Template not found", 404);
  if (req.body.htmlContent) {
    const variables = extractVariables(req.body.htmlContent);
    req.body.variables = variables.map((key) => ({ key, label: key, required: false }));
  }
  Object.assign(template, { ...req.body, updatedBy: req.admin._id });
  await template.save();
  await createAuditLog({ action: "TEMPLATE_UPDATED", entity: "EmailTemplate", entityId: template._id, entityName: template.name, performedBy: req.admin, description: `Template updated` });
  successResponse(res, { template }, "Template updated successfully");
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await EmailTemplate.findOne({ _id: req.params.id, isDeleted: false });
  if (!template) return errorResponse(res, "Template not found", 404);
  if (template.isDefault) return errorResponse(res, "Cannot delete a default template", 400);
  await EmailTemplate.findByIdAndUpdate(template._id, { isDeleted: true, deletedAt: new Date() });
  await createAuditLog({ action: "DELETE", entity: "EmailTemplate", entityId: template._id, entityName: template.name, performedBy: req.admin, description: `Template deleted` });
  successResponse(res, {}, "Template deleted successfully");
});

export const previewTemplate = asyncHandler(async (req, res) => {
  const { variables } = req.body;
  const template = await EmailTemplate.findOne({ _id: req.params.id, isDeleted: false });
  if (!template) return errorResponse(res, "Template not found", 404);
  const { compileTemplate } = await import("../utils/templateCompiler.js");
  const preview = compileTemplate(template.htmlContent, {
    ...(variables || {}),
    adminUrl: emailAppUrls.admin,
    webappUrl: emailAppUrls.webapp,
  });
  successResponse(res, { preview });
});