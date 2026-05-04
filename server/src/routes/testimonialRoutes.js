import express from "express";
import { getApprovedTestimonials, getFeaturedTestimonials, getAllTestimonials, getTestimonialById, createTestimonial, updateTestimonial, deleteTestimonial, approveTestimonial, rejectTestimonial, toggleFeatured, getTestimonialStats } from "../controllers/testimonialController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.get("/public", getApprovedTestimonials);
router.get("/public/featured", getFeaturedTestimonials);
router.use(protect);
router.get("/stats", getTestimonialStats);
router.get("/", checkPermission("testimonials", "read"), getAllTestimonials);
router.get("/:id", checkPermission("testimonials", "read"), getTestimonialById);
router.post("/", checkPermission("testimonials", "create"), uploadImage.single("clientAvatar"), createTestimonial);
router.put("/:id", checkPermission("testimonials", "update"), uploadImage.single("clientAvatar"), updateTestimonial);
router.patch("/:id/approve", checkPermission("testimonials", "update"), approveTestimonial);
router.patch("/:id/reject", checkPermission("testimonials", "update"), rejectTestimonial);
router.patch("/:id/toggle-featured", checkPermission("testimonials", "update"), toggleFeatured);
router.delete("/:id", checkPermission("testimonials", "delete"), deleteTestimonial);
export default router;