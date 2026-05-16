import Testimonial from "../models/Testimonial.js";
import { uploadSingleImage, deleteMedia } from "../services/uploadService.js";
import { createAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, paginatedResponse } from "../utils/apiResponse.js";

const coerceBoolean = (val) => {
  if (val === "true" || val === true) return true;
  if (val === "false" || val === false) return false;
  return val;
};

const coerceNumber = (val) => {
  if (val == null || val === "") return val;
  const num = Number(val);
  return Number.isNaN(num) ? val : num;
};

const normalizeEnum = (val, allowed) => {
  if (val == null || val === "") return undefined;
  const normalized = String(val).trim().toLowerCase().replace(/[\s-]+/g, "_");
  return allowed.includes(normalized) ? normalized : undefined;
};

const CATEGORY_ENUM = ["general", "web_development", "mobile_app", "design", "consulting", "support", "other"];
const STATUS_ENUM = ["pending", "approved", "rejected", "archived"];
const SOURCE_ENUM = ["direct", "google", "linkedin", "clutch", "goodfirms", "other"];

const normalizeTestimonialBody = (body) => {
  const data = { ...body };
  data.rating = coerceNumber(data.rating);
  data.order = coerceNumber(data.order);
  data.isVerified = coerceBoolean(data.isVerified);
  data.isFeatured = coerceBoolean(data.isFeatured);
  data.isTopRated = coerceBoolean(data.isTopRated);

  const normalizedCategory = normalizeEnum(data.category, CATEGORY_ENUM);
  const normalizedStatus = normalizeEnum(data.status, STATUS_ENUM);
  const normalizedSource = normalizeEnum(data.source, SOURCE_ENUM);
  if (normalizedCategory !== undefined) data.category = normalizedCategory;
  if (normalizedStatus !== undefined) data.status = normalizedStatus;
  if (normalizedSource !== undefined) data.source = normalizedSource;
  if (normalizedCategory === undefined) delete data.category;
  if (normalizedStatus === undefined) delete data.status;
  if (normalizedSource === undefined) delete data.source;
  if (typeof data.tags === "string") {
    try {
      const parsed = JSON.parse(data.tags);
      if (Array.isArray(parsed)) data.tags = parsed;
    } catch {
      // Leave as-is if not JSON.
    }
  }
  return data;
};

// Public
export const getApprovedTestimonials = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPaginationQuery(req.query);
  const { category, featured, rating } = req.query;
  const query = { status: "approved", isDeleted: false };
  if (category) query.category = category;
  if (featured === "true") query.isFeatured = true;
  if (rating) query.rating = { $gte: Number(rating) };

  const [testimonials, total] = await Promise.all([
    Testimonial.find(query).sort({ isFeatured: -1, rating: -1, order: 1, createdAt: -1 }).skip(skip).limit(limit),
    Testimonial.countDocuments(query),
  ]);
  paginatedResponse(res, { testimonials }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getFeaturedTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ status: "approved", isFeatured: true, isDeleted: false }).sort({ order: 1, rating: -1 }).limit(8);
  successResponse(res, { testimonials });
});

// Admin
export const getAllTestimonials = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPaginationQuery(req.query);
  const { status, category, search } = req.query;
  const query = { isDeleted: false };
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) query.$or = [{ clientName: { $regex: search, $options: "i" } }, { clientCompany: { $regex: search, $options: "i" } }];

  const [testimonials, total] = await Promise.all([
    Testimonial.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Testimonial.countDocuments(query),
  ]);
  paginatedResponse(res, { testimonials }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getTestimonialById = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findOne({ _id: req.params.id, isDeleted: false });
  if (!testimonial) return errorResponse(res, "Testimonial not found", 404);
  successResponse(res, { testimonial });
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const data = normalizeTestimonialBody({ ...req.body, createdBy: req.admin._id });
  if (req.file) {
    const img = await uploadSingleImage(req.file, "envalis/testimonials");
    data.clientAvatar = img;
  }
  const testimonial = await Testimonial.create(data);
  await createAuditLog({ action: "CREATE", entity: "Testimonial", entityId: testimonial._id, entityName: testimonial.clientName, performedBy: req.admin, description: `Testimonial created for ${testimonial.clientName}` });
  successResponse(res, { testimonial }, "Testimonial created successfully", 201);
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findOne({ _id: req.params.id, isDeleted: false });
  if (!testimonial) return errorResponse(res, "Testimonial not found", 404);
  const data = normalizeTestimonialBody(req.body);

  // Handle explicit avatar removal (user removed image without replacing)
  if (data.removeClientAvatar === "true" && !req.file) {
      if (testimonial.clientAvatar?.publicId) await deleteMedia(testimonial.clientAvatar.publicId).catch(() => {});
      data.clientAvatar = null;
  }
  delete data.removeClientAvatar;

  if (req.file) {
    if (testimonial.clientAvatar?.publicId) await deleteMedia(testimonial.clientAvatar.publicId).catch(() => {});
    const img = await uploadSingleImage(req.file, "envalis/testimonials");
    data.clientAvatar = img;
  }
  Object.assign(testimonial, { ...data, updatedBy: req.admin._id });
  await testimonial.save();
  await createAuditLog({ action: "UPDATE", entity: "Testimonial", entityId: testimonial._id, entityName: testimonial.clientName, performedBy: req.admin, description: `Testimonial updated` });
  successResponse(res, { testimonial }, "Testimonial updated successfully");
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findOne({ _id: req.params.id, isDeleted: false });
  if (!testimonial) return errorResponse(res, "Testimonial not found", 404);
  await Testimonial.findByIdAndUpdate(testimonial._id, { isDeleted: true, deletedAt: new Date() });
  await createAuditLog({ action: "DELETE", entity: "Testimonial", entityId: testimonial._id, entityName: testimonial.clientName, performedBy: req.admin, description: `Testimonial deleted` });
  successResponse(res, {}, "Testimonial deleted successfully");
});

export const approveTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { status: "approved", isVerified: true, updatedBy: req.admin._id }, { new: true });
  if (!testimonial) return errorResponse(res, "Testimonial not found", 404);
  await createAuditLog({ action: "UPDATE", entity: "Testimonial", entityId: testimonial._id, entityName: testimonial.clientName, performedBy: req.admin, description: `Testimonial approved` });
  successResponse(res, { testimonial }, "Testimonial approved successfully");
});

export const rejectTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { status: "rejected", updatedBy: req.admin._id }, { new: true });
  if (!testimonial) return errorResponse(res, "Testimonial not found", 404);
  successResponse(res, { testimonial }, "Testimonial rejected");
});

export const toggleFeatured = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findOne({ _id: req.params.id, isDeleted: false });
  if (!testimonial) return errorResponse(res, "Testimonial not found", 404);
  testimonial.isFeatured = !testimonial.isFeatured;
  await testimonial.save();
  successResponse(res, { isFeatured: testimonial.isFeatured }, `Testimonial ${testimonial.isFeatured ? "featured" : "unfeatured"}`);
});

export const getTestimonialStats = asyncHandler(async (req, res) => {
  const [total, byStatus, avgRating] = await Promise.all([
    Testimonial.countDocuments({ isDeleted: false }),
    Testimonial.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Testimonial.aggregate([{ $match: { status: "approved", isDeleted: false } }, { $group: { _id: null, avg: { $avg: "$rating" } } }]),
  ]);
  successResponse(res, { stats: { total, byStatus, averageRating: avgRating[0]?.avg?.toFixed(1) || 0 } });
});