import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";

export const generateToken = (id, expiresIn = process.env.JWT_EXPIRES_IN || "7d") => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

export const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
};

export const generate2FASecret = async (adminEmail) => {
    const secret = speakeasy.generateSecret({
        name: `Enovalis Admin (${adminEmail})`,
        length: 32,
    });
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return { secret: secret.base32, qrCode: qrCodeUrl, otpauth: secret.otpauth_url };
};

export const verify2FAToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 2,
    });
};

export const generateBackupCodes = () => {
    return Array.from({ length: 8 }, () => crypto.randomBytes(4).toString("hex").toUpperCase());
};

export const hashBackupCodes = async (codes) => {
    const bcrypt = await import("bcryptjs");
    return Promise.all(codes.map((code) => bcrypt.default.hash(code, 10)));
};

export const verifyBackupCode = async (inputCode, hashedCodes) => {
    const bcrypt = await import("bcryptjs");
    for (let i = 0; i < hashedCodes.length; i++) {
        const match = await bcrypt.default.compare(inputCode, hashedCodes[i]);
        if (match) return i;
    }
    return -1;
};