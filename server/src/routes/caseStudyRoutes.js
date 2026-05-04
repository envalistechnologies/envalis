import express from "express";
import { getPublishedCaseStudies, getCaseStudyBySlug, getAllCaseStudies, getCaseStudyById, createCaseStudy, updateCaseStudy, deleteCaseStudy, publishCaseStudy } from "../controllers/caseStudyController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.get("/public", getPublishedCaseStudies);
router.get("/public/:slug", getCaseStudyBySlug);
router.use(protect);
router.get("/", checkPermission("caseStudies", "read"), getAllCaseStudies);
router.get("/:id", checkPermission("caseStudies", "read"), getCaseStudyById);
router.post("/", checkPermission("caseStudies", "create"), uploadImage.fields([{ name: "coverImage", maxCount: 1 }, { name: "bannerImage", maxCount: 1 }, { name: "gallery", maxCount: 10 }, { name: "client.logo", maxCount: 1 }]), createCaseStudy);
router.put("/:id", checkPermission("caseStudies", "update"), uploadImage.fields([{ name: "coverImage", maxCount: 1 }, { name: "bannerImage", maxCount: 1 }, { name: "gallery", maxCount: 10 }, { name: "client.logo", maxCount: 1 }]), updateCaseStudy);
router.patch("/:id/publish", checkPermission("caseStudies", "update"), publishCaseStudy);
router.delete("/:id", checkPermission("caseStudies", "delete"), deleteCaseStudy);
export default router;