import Employee from "../models/Employee.js";
import { uploadSingleImage, uploadDocument, deleteMedia } from "../services/uploadService.js";
import { createAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, buildSearchQuery, paginatedResponse } from "../utils/apiResponse.js";

const parseJsonField = (obj, key) => {
    if (typeof obj[key] === "string") {
        try {
            const parsed = JSON.parse(obj[key]);
            if (typeof parsed === "object" && parsed !== null) obj[key] = parsed;
        } catch { /* keep original */ }
    }
};

const parseJsonArray = (obj, key) => {
    if (typeof obj[key] === "string") {
        try {
            const parsed = JSON.parse(obj[key]);
            if (Array.isArray(parsed)) { obj[key] = parsed; return; }
        } catch { /* keep original */ }
    }
    if (obj[key] !== undefined && !Array.isArray(obj[key]) && typeof obj[key] === "string") {
        obj[key] = [obj[key]];
    }
};

const parseEmployeeBody = (body) => {
    ["address", "emergencyContact", "salary"].forEach((k) => parseJsonField(body, k));
    ["education", "skills"].forEach((k) => parseJsonArray(body, k));
    // Convert string booleans from FormData
    if (typeof body.isActive === "string") body.isActive = body.isActive === "true";
};

export const getPublicEmployees = asyncHandler(async (req, res) => {
    const employees = await Employee.find({ isDeleted: false })
        .select("firstName lastName role avatar department bio socials")
        .sort({ order: 1, firstName: 1 });
    successResponse(res, { employees });
});

// Admin
export const getAllEmployees = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPaginationQuery(req.query);
  const { department, status, employmentType, search, isActive } = req.query;
  const query = { isDeleted: false };
  if (department) query.department = department;
  if (status) query.status = status;
  if (employmentType) query.employmentType = employmentType;
  if (isActive !== undefined) query.isActive = isActive === "true";
  if (search) Object.assign(query, buildSearchQuery(search, ["firstName", "lastName", "email", "designation", "employeeId"]));

  const [employees, total] = await Promise.all([
    Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-salary -documents"),
    Employee.countDocuments(query),
  ]);
  paginatedResponse(res, { employees }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false }).populate("createdBy", "firstName lastName");
  if (!employee) return errorResponse(res, "Employee not found", 404);
  successResponse(res, { employee });
});

export const createEmployee = asyncHandler(async (req, res) => {
  const existing = await Employee.findOne({ email: req.body.email });
  if (existing) return errorResponse(res, "Employee with this email already exists", 400);
  const data = { ...req.body, createdBy: req.admin._id };
  parseEmployeeBody(data);
  if (req.file) {
    const img = await uploadSingleImage(req.file, "envalis/employee-avatars");
    data.avatar = img;
  }
  const employee = await Employee.create(data);
  await createAuditLog({ action: "EMPLOYEE_CREATED", entity: "Employee", entityId: employee._id, entityName: `${employee.firstName} ${employee.lastName}`, performedBy: req.admin, description: `New employee created: ${employee.employeeId}`, severity: "medium" });
  successResponse(res, { employee }, "Employee created successfully", 201);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
  if (!employee) return errorResponse(res, "Employee not found", 404);
  const before = { firstName: employee.firstName, lastName: employee.lastName, department: employee.department, designation: employee.designation };
  const body = { ...req.body };
  parseEmployeeBody(body);
  if (req.file) {
    if (employee.avatar?.publicId) await deleteMedia(employee.avatar.publicId).catch(() => {});
    const img = await uploadSingleImage(req.file, "envalis/employee-avatars");
    body.avatar = img;
  }
  Object.assign(employee, { ...body, updatedBy: req.admin._id });
  await employee.save();
  await createAuditLog({ action: "EMPLOYEE_UPDATED", entity: "Employee", entityId: employee._id, entityName: `${employee.firstName} ${employee.lastName}`, performedBy: req.admin, description: `Employee updated`, changes: { before, after: req.body } });
  successResponse(res, { employee }, "Employee updated successfully");
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
  if (!employee) return errorResponse(res, "Employee not found", 404);
  await Employee.findByIdAndUpdate(employee._id, { isDeleted: true, deletedAt: new Date(), isActive: false, status: "resigned" });
  await createAuditLog({ action: "EMPLOYEE_DELETED", entity: "Employee", entityId: employee._id, entityName: `${employee.firstName} ${employee.lastName}`, performedBy: req.admin, description: `Employee record deleted`, severity: "high" });
  successResponse(res, {}, "Employee deleted successfully");
});

export const uploadEmployeeDocument = asyncHandler(async (req, res) => {
  if (!req.file) return errorResponse(res, "No document file provided", 400);
  const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
  if (!employee) return errorResponse(res, "Employee not found", 404);
  const doc = await uploadDocument(req.file, "envalis/employee-documents");
  employee.documents.push({ name: req.body.name || req.file.originalname, type: req.body.type || "other", ...doc, uploadedAt: new Date() });
  await employee.save();
  successResponse(res, { documents: employee.documents }, "Document uploaded successfully");
});

export const deleteEmployeeDocument = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
  if (!employee) return errorResponse(res, "Employee not found", 404);
  const docIndex = employee.documents.findIndex((d) => d._id.toString() === req.params.docId);
  if (docIndex === -1) return errorResponse(res, "Document not found", 404);
  const doc = employee.documents[docIndex];
  if (doc.publicId) await deleteMedia(doc.publicId).catch(() => {});
  employee.documents.splice(docIndex, 1);
  await employee.save();
  successResponse(res, {}, "Document deleted successfully");
});

export const getEmployeeStats = asyncHandler(async (req, res) => {
  const [total, byDepartment, byStatus, byEmploymentType] = await Promise.all([
    Employee.countDocuments({ isDeleted: false }),
    Employee.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$department", count: { $sum: 1 } } }]),
    Employee.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Employee.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$employmentType", count: { $sum: 1 } } }]),
  ]);
  successResponse(res, { stats: { total, byDepartment, byStatus, byEmploymentType } });
});

export const getEmployeesByDepartment = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ department: req.params.department, isDeleted: false, isActive: true }).select("firstName lastName designation avatar email");
  successResponse(res, { employees });
});