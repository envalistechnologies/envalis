import express from "express";
import { getPublicEmployees, getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, uploadEmployeeDocument, deleteEmployeeDocument, getEmployeeStats, getEmployeesByDepartment } from "../controllers/employeeController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { uploadImage, uploadDocument } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
router.get("/public", getPublicEmployees);

router.use(protect);
router.get("/stats", getEmployeeStats);
router.get("/department/:department", getEmployeesByDepartment);
router.get("/", checkPermission("employees", "read"), getAllEmployees);
router.get("/:id", checkPermission("employees", "read"), getEmployeeById);
router.post("/", checkPermission("employees", "create"), uploadImage.single("avatar"), createEmployee);
router.put("/:id", checkPermission("employees", "update"), uploadImage.single("avatar"), updateEmployee);
router.post("/:id/documents", checkPermission("employees", "update"), uploadDocument.single("document"), uploadEmployeeDocument);
router.delete("/:id/documents/:docId", checkPermission("employees", "update"), deleteEmployeeDocument);
router.delete("/:id", checkPermission("employees", "delete"), deleteEmployee);
export default router;