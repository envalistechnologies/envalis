import express from "express";
import { getAllAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin, changeAdminRole, updateAdminAvatar, toggleAdminStatus, getAdminStats } from "../controllers/adminController.js";
import { protect, superAdminOnly, authorize } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/stats", authorize("super_admin", "admin"), getAdminStats);
router.get("/", authorize("super_admin", "admin"), getAllAdmins);
router.get("/:id", authorize("super_admin", "admin"), getAdminById);
router.post("/", superAdminOnly, createAdmin);
router.put("/:id", superAdminOnly, updateAdmin);
router.patch("/:id/role", superAdminOnly, changeAdminRole);
router.patch("/:id/toggle-status", superAdminOnly, toggleAdminStatus);
router.patch("/:id/avatar", authorize("super_admin", "admin"), uploadImage.single("avatar"), updateAdminAvatar);
router.delete("/:id", superAdminOnly, deleteAdmin);

export default router;