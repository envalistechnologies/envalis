import crypto from "crypto";
import Admin from "../models/Admin.js";
import { generateToken, generateRefreshToken, generate2FASecret, verify2FAToken, generateBackupCodes, hashBackupCodes, verifyBackupCode } from "../services/authService.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { createAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, "Please provide email and password", 400);

    const admin = await Admin.findOne({ email, isDeleted: false }).select("+password +twoFactorEnabled +twoFactorSecret +loginAttempts +lockUntil +activeSessions");

    if (!admin) {
        await createAuditLog({ action: "LOGIN_FAILED", entity: "Admin", performedBy: null, description: `Failed login attempt for email: ${email}`, metadata: { ip: req.ipAddress, userAgent: req.userAgent }, status: "failure", severity: "medium" });
        return errorResponse(res, "Invalid email or password", 401);
    }

    if (admin.isLocked) {
        return errorResponse(res, "Account temporarily locked due to multiple failed attempts. Try again after 2 hours.", 423);
    }

    if (!admin.isActive || admin.isDeleted) return errorResponse(res, "Account is inactive. Contact super admin.", 401);

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
        await admin.incrementLoginAttempts();
        await createAuditLog({ action: "LOGIN_FAILED", entity: "Admin", entityId: admin._id, entityName: admin.email, performedBy: admin, description: "Incorrect password", metadata: { ip: req.ipAddress, userAgent: req.userAgent }, status: "failure", severity: "medium" });
        return errorResponse(res, "Invalid email or password", 401);
    }

    if (admin.twoFactorEnabled) {
        const tempToken = generateToken(admin._id, "10m");
        return successResponse(res, { requires2FA: true, tempToken }, "2FA verification required");
    }

    await finishLogin(admin, req, res);
});

export const verify2FA = asyncHandler(async (req, res) => {
    const { token, backupCode } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return errorResponse(res, "No token provided", 401);

    const tempToken = authHeader.split(" ")[1];
    const jwt = await import("jsonwebtoken");
    const decoded = jwt.default.verify(tempToken, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("+twoFactorSecret +twoFactorBackupCodes +twoFactorEnabled +activeSessions");
    if (!admin) return errorResponse(res, "Admin not found", 404);

    if (token) {
        const isValid = verify2FAToken(admin.twoFactorSecret, token);
        if (!isValid) return errorResponse(res, "Invalid 2FA code", 401);
    } else if (backupCode) {
        const codeIndex = await verifyBackupCode(backupCode, admin.twoFactorBackupCodes);
        if (codeIndex === -1) return errorResponse(res, "Invalid backup code", 401);
        const updatedCodes = admin.twoFactorBackupCodes.filter((_, i) => i !== codeIndex);
        admin.twoFactorBackupCodes = updatedCodes;
        await admin.save();
    } else {
        return errorResponse(res, "Please provide a 2FA code or backup code", 400);
    }

    await finishLogin(admin, req, res);
});

const finishLogin = async (admin, req, res) => {
    await Admin.findByIdAndUpdate(admin._id, {
        $set: { loginAttempts: 0, lastLogin: new Date(), lastLoginIP: req.ipAddress, lastLoginDevice: req.userAgent },
        $unset: { lockUntil: 1 },
    });

    await createAuditLog({ action: "LOGIN", entity: "Admin", entityId: admin._id, entityName: `${admin.firstName} ${admin.lastName}`, performedBy: admin, description: `Admin logged in successfully`, metadata: { ip: req.ipAddress, userAgent: req.userAgent }, status: "success" });

    const accessToken = generateToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    const adminData = await Admin.findById(admin._id).select("-password -twoFactorSecret -twoFactorBackupCodes");
    successResponse(res, { admin: adminData, accessToken, refreshToken }, "Logged in successfully");
};

export const logout = asyncHandler(async (req, res) => {
    await createAuditLog({ action: "LOGOUT", entity: "Admin", entityId: req.admin._id, entityName: `${req.admin.firstName} ${req.admin.lastName}`, performedBy: req.admin, description: "Admin logged out", metadata: { ip: req.ipAddress, userAgent: req.userAgent } });
    successResponse(res, {}, "Logged out successfully");
});

export const getMe = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id).select("-password -twoFactorSecret -twoFactorBackupCodes");
    successResponse(res, { admin });
});

export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id).select("+password");
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) return errorResponse(res, "Current password is incorrect", 400);
    admin.password = newPassword;
    await admin.save();
    await createAuditLog({ action: "PASSWORD_CHANGE", entity: "Admin", entityId: admin._id, entityName: admin.email, performedBy: req.admin, description: "Password changed", metadata: { ip: req.ipAddress }, severity: "medium" });
    successResponse(res, {}, "Password changed successfully");
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const admin = await Admin.findOne({ email: req.body.email, isDeleted: false });
    if (!admin) return successResponse(res, {}, "If that email exists, a reset link has been sent.");
    const resetToken = admin.createPasswordResetToken();
    await admin.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(admin, resetToken);
    successResponse(res, {}, "Password reset link sent to email");
});

export const resetPassword = asyncHandler(async (req, res) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const admin = await Admin.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    if (!admin) return errorResponse(res, "Token is invalid or has expired", 400);
    admin.password = req.body.password;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();
    successResponse(res, {}, "Password reset successfully");
});

export const setup2FA = asyncHandler(async (req, res) => {
    const { secret, qrCode } = await generate2FASecret(req.admin.email);
    await Admin.findByIdAndUpdate(req.admin._id, { twoFactorSecret: secret });
    successResponse(res, { qrCode, secret }, "Scan the QR code with your authenticator app");
});

export const enable2FA = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const admin = await Admin.findById(req.admin._id).select("+twoFactorSecret");
    const isValid = verify2FAToken(admin.twoFactorSecret, token);
    if (!isValid) return errorResponse(res, "Invalid 2FA token", 400);

    const backupCodes = generateBackupCodes();
    const hashedCodes = await hashBackupCodes(backupCodes);
    await Admin.findByIdAndUpdate(req.admin._id, { twoFactorEnabled: true, twoFactorBackupCodes: hashedCodes });
    await createAuditLog({ action: "TWO_FA_ENABLED", entity: "Admin", entityId: req.admin._id, entityName: req.admin.email, performedBy: req.admin, description: "2FA enabled", severity: "high" });
    successResponse(res, { backupCodes }, "2FA enabled successfully. Save these backup codes.");
});

export const disable2FA = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const admin = await Admin.findById(req.admin._id).select("+twoFactorSecret");
    const isValid = verify2FAToken(admin.twoFactorSecret, token);
    if (!isValid) return errorResponse(res, "Invalid 2FA token", 400);
    await Admin.findByIdAndUpdate(req.admin._id, { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] });
    await createAuditLog({ action: "TWO_FA_DISABLED", entity: "Admin", entityId: req.admin._id, entityName: req.admin.email, performedBy: req.admin, description: "2FA disabled", severity: "high" });
    successResponse(res, {}, "2FA disabled successfully");
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, phone, department } = req.body;
    const admin = await Admin.findByIdAndUpdate(req.admin._id, { firstName, lastName, phone, department, updatedBy: req.admin._id }, { new: true, runValidators: true }).select("-password -twoFactorSecret -twoFactorBackupCodes");
    successResponse(res, { admin }, "Profile updated successfully");
});

export const updateProfileAvatar = asyncHandler(async (req, res) => {
    if (!req.file) return errorResponse(res, "No avatar file provided", 400);
    const { uploadSingleImage, deleteMedia } = await import("../services/uploadService.js");
    const currentAdmin = await Admin.findById(req.admin._id);
    if (currentAdmin?.avatar?.publicId) await deleteMedia(currentAdmin.avatar.publicId).catch(() => {});
    const img = await uploadSingleImage(req.file, "enovalis/admin-avatars");
    const admin = await Admin.findByIdAndUpdate(req.admin._id, { avatar: img }, { new: true }).select("-password -twoFactorSecret -twoFactorBackupCodes");
    successResponse(res, { admin }, "Avatar updated successfully");
});