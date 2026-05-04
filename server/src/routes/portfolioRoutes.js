// portfolioRoutes.js
import express from "express";
import { getPublishedPortfolios, getPortfolioBySlug, getAllPortfolios, getPortfolioById, createPortfolio, updatePortfolio, deletePortfolio, reorderPortfolios } from "../controllers/portfolioController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.get("/public", getPublishedPortfolios);
router.get("/public/:slug", getPortfolioBySlug);
router.use(protect);
router.get("/", checkPermission("portfolios", "read"), getAllPortfolios);
router.get("/:id", checkPermission("portfolios", "read"), getPortfolioById);
router.post("/", checkPermission("portfolios", "create"), uploadImage.fields([{ name: "coverImage", maxCount: 1 }, { name: "gallery", maxCount: 10 }]), createPortfolio);
router.put("/:id", checkPermission("portfolios", "update"), uploadImage.fields([{ name: "coverImage", maxCount: 1 }, { name: "gallery", maxCount: 10 }]), updatePortfolio);
router.patch("/reorder", checkPermission("portfolios", "update"), reorderPortfolios);
router.delete("/:id", checkPermission("portfolios", "delete"), deletePortfolio);
export default router;