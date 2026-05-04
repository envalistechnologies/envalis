import express from "express";
import { getPublishedResources, getResourceBySlug, getAllResources, getResourceById, createResource, updateResource, deleteResource } from "../controllers/resourceController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { uploadImage, uploadDocument, uploadAny } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.get("/public", getPublishedResources);
router.get("/public/:slug", getResourceBySlug);

router.use(protect);
router.get("/", checkPermission("resources", "read"), getAllResources);
router.get("/:id", checkPermission("resources", "read"), getResourceById);
router.post("/", checkPermission("resources", "create"), uploadAny.fields([{ name: "coverImage", maxCount: 1 }, { name: "file", maxCount: 1 }]), createResource);
router.put("/:id", checkPermission("resources", "update"), uploadAny.fields([{ name: "coverImage", maxCount: 1 }, { name: "file", maxCount: 1 }]), updateResource);
router.delete("/:id", checkPermission("resources", "delete"), deleteResource);
export default router;