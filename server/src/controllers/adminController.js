import crypto from "crypto";
import Admin from "../models/Admin.js";
import { sendWelcomeAdminEmail } from "../services/emailService.js";
import { createAuditLog } from "../services/auditService.js";
import { uploadSingleImage, deleteMedia } from "../services/uploadService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, buildSearchQuery, buildSortQuery, paginatedResponse } from "../utils/apiResponse.js";

export const getAllAdmins = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { search, role, isActive, sortBy, sortOrder } = req.query;

    const query = { isDeleted: false };
    if (role && role !== "") query.role = role;
    if (isActive !== undefined && isActive !== "") query.isActive = isActive === "true";
    if (search) {
        const searchQ = buildSearchQuery(search, ["firstName", "lastName", "email", "department"]);
        Object.assign(query, searchQ);
    }

    const sort = buildSortQuery(sortBy, sortOrder);
    const [admins, total] = await Promise.all([
        Admin.find(query).sort(sort).skip(skip).limit(limit).select("-password -twoFactorSecret -twoFactorBackupCodes").populate("createdBy", "firstName lastName email"),
        Admin.countDocuments(query),
    ]);

    paginatedResponse(res, { admins }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getAdminById = asyncHandler(async (req, res) => {
    const admin = await Admin.findOne({ _id: req.params.id, isDeleted: false }).select("-password -twoFactorSecret -twoFactorBackupCodes").populate("createdBy", "firstName lastName email");
    if (!admin) return errorResponse(res, "Admin not found", 404);
    successResponse(res, { admin });
});

export const createAdmin = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, role, department, phone } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) return errorResponse(res, "Admin with this email already exists", 400);

    const tempPassword = crypto.randomBytes(8).toString("hex");
    const admin = new Admin({ firstName, lastName, email, password: tempPassword, role, department, phone, createdBy: req.admin._id });
    admin.setDefaultPermissions();
    await admin.save();

    let emailSent = true;
    try {
        await sendWelcomeAdminEmail(admin, tempPassword);
    } catch (error) {
        console.error("Welcome email failed:", error.message);
        emailSent = false;
    }

    await createAuditLog({ action: "ADMIN_CREATED", entity: "Admin", entityId: admin._id, entityName: `${firstName} ${lastName}`, performedBy: req.admin, description: `New admin created: ${email} with role ${role}. Email sent: ${emailSent}`, severity: "high" });

    const adminData = await Admin.findById(admin._id).select("-password -twoFactorSecret -twoFactorBackupCodes");
    successResponse(
        res, 
        { admin: adminData, emailSent, tempPassword: emailSent ? undefined : tempPassword }, 
        emailSent ? "Admin created successfully" : "Admin created, but welcome email failed. Please provide the temporary password manually.", 
        201
    );
});

export const updateAdmin = asyncHandler(async (req, res) => {
    const { firstName, lastName, phone, department, isActive, permissions } = req.body;
    const admin = await Admin.findOne({ _id: req.params.id, isDeleted: false });
    if (!admin) return errorResponse(res, "Admin not found", 404);
    if (admin.isSuperAdmin) return errorResponse(res, "Cannot modify Super Admin through this endpoint", 403);

    const before = { firstName: admin.firstName, lastName: admin.lastName, isActive: admin.isActive };
    Object.assign(admin, { firstName, lastName, phone, department, isActive, updatedBy: req.admin._id });
    if (permissions) admin.permissions = permissions;
    await admin.save();

    await createAuditLog({ action: "UPDATE", entity: "Admin", entityId: admin._id, entityName: `${admin.firstName} ${admin.lastName}`, performedBy: req.admin, description: `Admin updated`, changes: { before, after: { firstName, lastName, isActive } } });
    const updated = await Admin.findById(admin._id).select("-password -twoFactorSecret -twoFactorBackupCodes");
    successResponse(res, { admin: updated }, "Admin updated successfully");
});

export const changeAdminRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const admin = await Admin.findOne({ _id: req.params.id, isDeleted: false });
    if (!admin) return errorResponse(res, "Admin not found", 404);
    if (admin.isSuperAdmin) return errorResponse(res, "Cannot change Super Admin role", 403);

    const oldRole = admin.role;
    admin.role = role;
    admin.setDefaultPermissions();
    admin.updatedBy = req.admin._id;
    await admin.save();

    await createAuditLog({ action: "ROLE_CHANGE", entity: "Admin", entityId: admin._id, entityName: admin.email, performedBy: req.admin, description: `Role changed from ${oldRole} to ${role}`, changes: { before: { role: oldRole }, after: { role } }, severity: "high" });
    successResponse(res, {}, "Admin role updated successfully");
});

export const deleteAdmin = asyncHandler(async (req, res) => {
    const admin = await Admin.findOne({ _id: req.params.id, isDeleted: false });
    if (!admin) return errorResponse(res, "Admin not found", 404);
    if (admin.isSuperAdmin) return errorResponse(res, "Super Admin cannot be deleted", 403);
    if (admin._id.toString() === req.admin._id.toString()) return errorResponse(res, "You cannot delete yourself", 400);

    await Admin.findByIdAndUpdate(admin._id, { isDeleted: true, deletedAt: new Date(), isActive: false });
    await createAuditLog({ action: "ADMIN_DELETED", entity: "Admin", entityId: admin._id, entityName: admin.email, performedBy: req.admin, description: `Admin account deleted: ${admin.email}`, severity: "critical" });
    successResponse(res, {}, "Admin deleted successfully");
});

export const updateAdminAvatar = asyncHandler(async (req, res) => {
    if (!req.file) return errorResponse(res, "No image file provided", 400);
    const admin = await Admin.findById(req.params.id);
    if (!admin) return errorResponse(res, "Admin not found", 404);
    if (admin.avatar?.publicId) await deleteMedia(admin.avatar.publicId).catch(() => { });
    const result = await uploadSingleImage(req.file, "envalis/admin-avatars");
    await Admin.findByIdAndUpdate(admin._id, { avatar: result });
    successResponse(res, { avatar: result }, "Avatar updated successfully");
});

export const toggleAdminStatus = asyncHandler(async (req, res) => {
    const admin = await Admin.findOne({ _id: req.params.id, isDeleted: false });
    if (!admin) return errorResponse(res, "Admin not found", 404);
    if (admin.isSuperAdmin) return errorResponse(res, "Cannot deactivate Super Admin", 403);
    admin.isActive = !admin.isActive;
    admin.updatedBy = req.admin._id;
    await admin.save();
    await createAuditLog({ action: "UPDATE", entity: "Admin", entityId: admin._id, entityName: admin.email, performedBy: req.admin, description: `Admin ${admin.isActive ? "activated" : "deactivated"}`, severity: "medium" });
    successResponse(res, { isActive: admin.isActive }, `Admin ${admin.isActive ? "activated" : "deactivated"} successfully`);
});

export const getAdminStats = asyncHandler(async (req, res) => {
    const [total, active, superAdmins, with2FA, byRole] = await Promise.all([
        Admin.countDocuments({ isDeleted: false }),
        Admin.countDocuments({ isDeleted: false, isActive: true }),
        Admin.countDocuments({ isDeleted: false, isSuperAdmin: true }),
        Admin.countDocuments({ isDeleted: false, twoFactorEnabled: true }),
        Admin.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$role", count: { $sum: 1 } } }]),
    ]);
    successResponse(res, { total, active, inactive: total - active, superAdmins, with2FA, byRole }, "Stats fetched");
});