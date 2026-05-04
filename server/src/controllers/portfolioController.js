import Portfolio from "../models/Portfolio.js";
import { uploadSingleImage, uploadMultipleImages, deleteMedia } from "../services/uploadService.js";
import { createAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, paginatedResponse } from "../utils/apiResponse.js";

const parseJsonField = (obj, key) => {
    if (typeof obj[key] === "string") {
        try {
            const parsed = JSON.parse(obj[key]);
            if (typeof parsed === "object" && parsed !== null) obj[key] = parsed;
        } catch { /* keep original */ }
    }
};

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

const parsePortfolioBody = (body) => {
    ["client", "testimonial"].forEach((k) => parseJsonField(body, k));
    ["results", "tags", "technologies", "services"].forEach((k) => parseJsonArray(body, k));
};

// Public
export const getPublishedPortfolios = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPaginationQuery(req.query);
  const { category, tag, search, featured } = req.query;
  const query = { status: "published", isDeleted: false };
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (featured === "true") query.isFeatured = true;
  if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { "client.name": { $regex: search, $options: "i" } }, { technologies: { $regex: search, $options: "i" } }];

  const [portfolios, total] = await Promise.all([
    Portfolio.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).select("-gallery"),
    Portfolio.countDocuments(query),
  ]);
  paginatedResponse(res, { portfolios }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getPortfolioBySlug = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { slug: req.params.slug, status: "published", isDeleted: false },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!portfolio) return errorResponse(res, "Portfolio not found", 404);
  successResponse(res, { portfolio });
});

// Admin
export const getAllPortfolios = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPaginationQuery(req.query);
  const { status, category, search } = req.query;
  const query = { isDeleted: false };
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { "client.name": { $regex: search, $options: "i" } }];

  const [portfolios, total] = await Promise.all([
    Portfolio.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
    Portfolio.countDocuments(query),
  ]);
  paginatedResponse(res, { portfolios }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getPortfolioById = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ _id: req.params.id, isDeleted: false });
  if (!portfolio) return errorResponse(res, "Portfolio not found", 404);
  successResponse(res, { portfolio });
});

export const createPortfolio = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  parsePortfolioBody(body);
  const portfolioData = { ...body, createdBy: req.admin._id };
  const files = req.files || {};
  if (files.coverImage?.[0]) {
    const img = await uploadSingleImage(files.coverImage[0], "envalis/portfolios");
    portfolioData.coverImage = { ...img, alt: portfolioData.title };
  }
  if (files.gallery) {
    const imgs = await uploadMultipleImages(files.gallery, "envalis/portfolios/gallery");
    portfolioData.gallery = imgs.map((img) => ({ ...img, alt: portfolioData.title }));
  }
  const portfolio = await Portfolio.create(portfolioData);
  await createAuditLog({ action: "CREATE", entity: "Portfolio", entityId: portfolio._id, entityName: portfolio.title, performedBy: req.admin, description: `Portfolio created: ${portfolio.title}` });
  successResponse(res, { portfolio }, "Portfolio created successfully", 201);
});

export const updatePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ _id: req.params.id, isDeleted: false });
  if (!portfolio) return errorResponse(res, "Portfolio not found", 404);
  const body = { ...req.body };
  parsePortfolioBody(body);
  const files = req.files || {};
  if (files.coverImage?.[0]) {
    if (portfolio.coverImage?.publicId) await deleteMedia(portfolio.coverImage.publicId).catch(() => {});
    const img = await uploadSingleImage(files.coverImage[0], "envalis/portfolios");
    body.coverImage = { ...img, alt: body.title || portfolio.title };
  }
  if (files.gallery) {
    const imgs = await uploadMultipleImages(files.gallery, "envalis/portfolios/gallery");
    body.gallery = [...(portfolio.gallery || []), ...imgs.map((img) => ({ ...img, alt: portfolio.title }))];
  }
  Object.assign(portfolio, { ...body, updatedBy: req.admin._id });
  await portfolio.save();
  await createAuditLog({ action: "UPDATE", entity: "Portfolio", entityId: portfolio._id, entityName: portfolio.title, performedBy: req.admin, description: `Portfolio updated` });
  successResponse(res, { portfolio }, "Portfolio updated successfully");
});

export const deletePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ _id: req.params.id, isDeleted: false });
  if (!portfolio) return errorResponse(res, "Portfolio not found", 404);
  await Portfolio.findByIdAndUpdate(portfolio._id, { isDeleted: true, deletedAt: new Date() });
  await createAuditLog({ action: "DELETE", entity: "Portfolio", entityId: portfolio._id, entityName: portfolio.title, performedBy: req.admin, description: `Portfolio deleted` });
  successResponse(res, {}, "Portfolio deleted successfully");
});

export const reorderPortfolios = asyncHandler(async (req, res) => {
  const { items } = req.body;
  await Promise.all(items.map(({ id, order }) => Portfolio.findByIdAndUpdate(id, { order })));
  successResponse(res, {}, "Portfolios reordered successfully");
});