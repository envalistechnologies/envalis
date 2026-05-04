// projectRoutes.js
import express from "express";
import { getAllProjects, getProjectById, createProject, updateProject, deleteProject, getProjectStats } from "../controllers/projectController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(protect);
router.get("/stats", getProjectStats);
router.get("/", checkPermission("projects", "read"), getAllProjects);
router.get("/:id", checkPermission("projects", "read"), getProjectById);
router.post("/", checkPermission("projects", "create"), createProject);
router.put("/:id", checkPermission("projects", "update"), updateProject);
router.delete("/:id", checkPermission("projects", "delete"), deleteProject);
export default router;