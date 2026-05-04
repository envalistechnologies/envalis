import express from "express";
import { getPublishedBlogs, getBlogBySlug, getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog, publishBlog, unpublishBlog, getBlogStats } from "../controllers/blogController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/public", getPublishedBlogs);
router.get("/public/:slug", getBlogBySlug);

// Admin routes
router.use(protect);
router.get("/stats", getBlogStats);
router.get("/", checkPermission("blogs", "read"), getAllBlogs);
router.get("/:id", checkPermission("blogs", "read"), getBlogById);
router.post("/", checkPermission("blogs", "create"), uploadImage.fields([{ name: "coverImage", maxCount: 1 }, { name: "gallery", maxCount: 12 }]), createBlog);
router.put("/:id", checkPermission("blogs", "update"), uploadImage.fields([{ name: "coverImage", maxCount: 1 }, { name: "gallery", maxCount: 12 }]), updateBlog);
router.patch("/:id/publish", checkPermission("blogs", "update"), publishBlog);
router.patch("/:id/unpublish", checkPermission("blogs", "update"), unpublishBlog);
router.delete("/:id", checkPermission("blogs", "delete"), deleteBlog);

export default router;