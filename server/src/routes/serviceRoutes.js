import express from "express";
import { getPublishedServices, getServiceBySlug, getAllServices, getServiceById, createService, updateService, deleteService } from "../controllers/serviceController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.get("/public", getPublishedServices);
router.get("/public/:slug", getServiceBySlug);
router.use(protect);
router.get("/", checkPermission("services", "read"), getAllServices);
router.get("/:id", checkPermission("services", "read"), getServiceById);
router.post("/", checkPermission("services", "create"), uploadImage.fields([{ name: "coverImage", maxCount: 1 }, { name: "bannerImage", maxCount: 1 }]), createService);
router.put("/:id", checkPermission("services", "update"), uploadImage.fields([{ name: "coverImage", maxCount: 1 }, { name: "bannerImage", maxCount: 1 }]), updateService);
router.delete("/:id", checkPermission("services", "delete"), deleteService);
export default router;