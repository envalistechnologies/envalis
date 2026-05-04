import express from "express";
import { submitContact, getAllContacts, getContactById, updateContactStatus, deleteContact, getContactStats } from "../controllers/contactController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", submitContact);
router.use(protect);
router.get("/stats", getContactStats);
router.get("/", checkPermission("contacts", "read"), getAllContacts);
router.get("/:id", checkPermission("contacts", "read"), getContactById);
router.patch("/:id", checkPermission("contacts", "read"), updateContactStatus);
router.delete("/:id", checkPermission("contacts", "delete"), deleteContact);
export default router;