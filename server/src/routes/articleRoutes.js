import express from "express";
import { getPublishedArticles, getArticleBySlug, getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle, publishArticle, getArticleStats } from "../controllers/articleController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/public", getPublishedArticles);
router.get("/public/:slug", getArticleBySlug);

router.use(protect);
router.get("/stats", getArticleStats);
router.get("/", checkPermission("articles", "read"), getAllArticles);
router.get("/:id", checkPermission("articles", "read"), getArticleById);
router.post("/", checkPermission("articles", "create"), uploadImage.single("coverImage"), createArticle);
router.put("/:id", checkPermission("articles", "update"), uploadImage.single("coverImage"), updateArticle);
router.patch("/:id/publish", checkPermission("articles", "update"), publishArticle);
router.delete("/:id", checkPermission("articles", "delete"), deleteArticle);

export default router;