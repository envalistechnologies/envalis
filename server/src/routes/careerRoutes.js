import express from "express";
import { getActiveJobs, getJobBySlug, applyForJob, getAllJobs, getJobById, createJob, updateJob, deleteJob, getApplications, updateApplicationStatus, getCareerStats } from "../controllers/careerController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { uploadResume } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.get("/public", getActiveJobs);
router.get("/public/:slug", getJobBySlug);
router.post("/:id/apply", uploadResume.single("resume"), applyForJob);
router.use(protect);
router.get("/stats", getCareerStats);
router.get("/", checkPermission("careers", "read"), getAllJobs);
router.get("/:id", checkPermission("careers", "read"), getJobById);
router.get("/:id/applications", checkPermission("careers", "read"), getApplications);
router.patch("/:id/applications/:appId/status", checkPermission("careers", "update"), updateApplicationStatus);
router.post("/", checkPermission("careers", "create"), createJob);
router.put("/:id", checkPermission("careers", "update"), updateJob);
router.delete("/:id", checkPermission("careers", "delete"), deleteJob);
export default router;