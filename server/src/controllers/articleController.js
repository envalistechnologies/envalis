import Article from "../models/Article.js";
import { uploadSingleImage, deleteMedia } from "../services/uploadService.js";
import { createAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, buildSortQuery, paginatedResponse } from "../utils/apiResponse.js";

const parseJsonArray = (obj, key) => {
    if (typeof obj[key] === "string") {
        try {
            const parsed = JSON.parse(obj[key]);
            if (Array.isArray(parsed)) { obj[key] = parsed; return; }
        } catch { /* keep original */ }
    }
    if (obj[key] !== undefined && !Array.isArray(obj[key]) && typeof obj[key] === "string" && obj[key] !== "[]") {
        obj[key] = [obj[key]];
    }
};

const parseArticleBody = (body) => {
    parseJsonArray(body, "tags");
    parseJsonArray(body, "references");
    if (!body.scheduledAt) delete body.scheduledAt;
};

// Public
export const getPublishedArticles = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { category, tag, search, featured, premium } = req.query;
    const query = { status: "published", isDeleted: false };
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (featured === "true") query.isFeatured = true;
    if (premium !== undefined) query.isPremium = premium === "true";
    if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { excerpt: { $regex: search, $options: "i" } }];

    const [articles, total] = await Promise.all([
        Article.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit).select("-content").populate("author", "firstName lastName avatar"),
        Article.countDocuments(query),
    ]);
    paginatedResponse(res, { articles }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getArticleBySlug = asyncHandler(async (req, res) => {
    const article = await Article.findOneAndUpdate(
        { slug: req.params.slug, status: "published", isDeleted: false },
        { $inc: { views: 1 } },
        { new: true }
    ).populate("author", "firstName lastName avatar").populate("coAuthors", "firstName lastName avatar");
    if (!article) return errorResponse(res, "Article not found", 404);
    successResponse(res, { article });
});

// Admin
export const getAllArticles = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { status, category, search } = req.query;
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { tags: { $regex: search, $options: "i" } }];

    const [articles, total] = await Promise.all([
        Article.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("author", "firstName lastName"),
        Article.countDocuments(query),
    ]);
    paginatedResponse(res, { articles }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getArticleById = asyncHandler(async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id, isDeleted: false }).populate("author", "firstName lastName").populate("coAuthors", "firstName lastName");
    if (!article) return errorResponse(res, "Article not found", 404);
    successResponse(res, { article });
});

export const createArticle = asyncHandler(async (req, res) => {
    const body = { ...req.body };
    parseArticleBody(body);
    
    const articleData = { ...body, author: req.admin._id, createdBy: req.admin._id };
    if (req.file) {
        const img = await uploadSingleImage(req.file, "envalis/articles");
        articleData.coverImage = { ...img, alt: body.coverImageAlt || articleData.title };
    }
    const article = await Article.create(articleData);
    await createAuditLog({ action: "CREATE", entity: "Article", entityId: article._id, entityName: article.title, performedBy: req.admin, description: `Article created: ${article.title}` });
    successResponse(res, { article }, "Article created successfully", 201);
});

export const updateArticle = asyncHandler(async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id, isDeleted: false });
    if (!article) return errorResponse(res, "Article not found", 404);
    const body = { ...req.body };
    parseArticleBody(body);
    
    if (req.file) {
        if (article.coverImage?.publicId) await deleteMedia(article.coverImage.publicId).catch(() => { });
        const img = await uploadSingleImage(req.file, "envalis/articles");
        body.coverImage = { ...img, alt: body.coverImageAlt || article.title };
    }
    Object.assign(article, { ...body, updatedBy: req.admin._id });
    await article.save();
    await createAuditLog({ action: "UPDATE", entity: "Article", entityId: article._id, entityName: article.title, performedBy: req.admin, description: `Article updated` });
    successResponse(res, { article }, "Article updated successfully");
});

export const deleteArticle = asyncHandler(async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id, isDeleted: false });
    if (!article) return errorResponse(res, "Article not found", 404);
    await Article.findByIdAndUpdate(article._id, { isDeleted: true, deletedAt: new Date() });
    await createAuditLog({ action: "DELETE", entity: "Article", entityId: article._id, entityName: article.title, performedBy: req.admin, description: `Article deleted: ${article.title}` });
    successResponse(res, {}, "Article deleted successfully");
});

export const publishArticle = asyncHandler(async (req, res) => {
    const article = await Article.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { status: "published", publishedAt: new Date(), updatedBy: req.admin._id }, { new: true });
    if (!article) return errorResponse(res, "Article not found", 404);
    await createAuditLog({ action: "PUBLISH", entity: "Article", entityId: article._id, entityName: article.title, performedBy: req.admin, description: `Article published` });
    successResponse(res, { article }, "Article published successfully");
});

export const getArticleStats = asyncHandler(async (req, res) => {
    const [total, byStatus, byCategory] = await Promise.all([
        Article.countDocuments({ isDeleted: false }),
        Article.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
        Article.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
    ]);
    successResponse(res, { stats: { total, byStatus, byCategory } });
});