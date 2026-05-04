import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized. No token provided." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select("+twoFactorEnabled");
        if (!admin) {
            return res.status(401).json({ success: false, message: "Admin not found." });
        }
        if (!admin.isActive || admin.isDeleted) {
            return res.status(401).json({ success: false, message: "Account is inactive or deleted." });
        }
        if (admin.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({ success: false, message: "Password changed recently. Please log in again." });
        }
        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token." });
        }
        return res.status(500).json({ success: false, message: "Authentication error." });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.admin.role}' is not authorized to access this route.`,
            });
        }
        next();
    };
};

export const checkPermission = (resource, action) => {
    return (req, res, next) => {
        const admin = req.admin;
        if (admin.role === "super_admin") return next();
        const perm = admin.permissions?.[resource]?.[action];
        if (!perm) {
            return res.status(403).json({
                success: false,
                message: `You do not have permission to ${action} ${resource}.`,
            });
        }
        next();
    };
};

export const superAdminOnly = (req, res, next) => {
    if (req.admin.role !== "super_admin") {
        return res.status(403).json({ success: false, message: "Only Super Admin can perform this action." });
    }
    next();
};