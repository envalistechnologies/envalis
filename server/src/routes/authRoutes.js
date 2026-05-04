import express from "express";
import { login, verify2FA, logout, getMe, changePassword, forgotPassword, resetPassword, setup2FA, enable2FA, disable2FA, updateProfile, updateProfileAvatar } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/verify-2fa", verify2FA);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

router.use(protect);
router.post("/logout", logout);
router.get("/me", getMe);
router.patch("/change-password", changePassword);
router.patch("/update-profile", updateProfile);
router.patch("/update-avatar", uploadImage.single("avatar"), updateProfileAvatar);
router.get("/setup-2fa", setup2FA);
router.post("/enable-2fa", enable2FA);
router.post("/disable-2fa", disable2FA);

export default router;