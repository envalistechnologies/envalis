import CaseStudy from "../models/CaseStudy.js";
import { uploadSingleImage, uploadMultipleImages, deleteMedia } from "../services/uploadService.js";
import { createAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, paginatedResponse } from "../utils/apiResponse.js";

const parseJsonField = (obj, key) => {
  if (typeof obj[key] === "string") {
    try { obj[key] = JSON.parse(obj[key]); } catch { delete obj[key]; }
  }
};

// Public
export const getPublishedCaseStudies = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPaginationQuery(req.query);
  const { category, tag, search, featured } = req.query;
  const query = { status: "published", isDeleted: false };
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (featured === "true") query.isFeatured = true;
  if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { "client.name": { $regex: search, $options: "i" } }, { "client.industry": { $regex: search, $options: "i" } }];

  const [caseStudies, total] = await Promise.all([
    CaseStudy.find(query).sort({ order: 1, publishedAt: -1 }).skip(skip).limit(limit).select("-implementation -background"),
    CaseStudy.countDocuments(query),
  ]);
  paginatedResponse(res, { caseStudies }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getCaseStudyBySlug = asyncHandler(async (req, res) => {
  const caseStudy = await CaseStudy.findOneAndUpdate(
    { slug: req.params.slug, status: "published", isDeleted: false },
    { $inc: { views: 1 } },
    { new: true }
  ).populate("relatedCaseStudies", "title slug coverImage client category");
  if (!caseStudy) return errorResponse(res, "Case Study not found", 404);
  successResponse(res, { caseStudy });
});

// Admin
export const getAllCaseStudies = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPaginationQuery(req.query);
  const { status, category, search } = req.query;
  const query = { isDeleted: false };
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { "client.name": { $regex: search, $options: "i" } }];

  const [caseStudies, total] = await Promise.all([
    CaseStudy.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    CaseStudy.countDocuments(query),
  ]);
  paginatedResponse(res, { caseStudies }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getCaseStudyById = asyncHandler(async (req, res) => {
  const caseStudy = await CaseStudy.findOne({ _id: req.params.id, isDeleted: false });
  if (!caseStudy) return errorResponse(res, "Case Study not found", 404);
  successResponse(res, { caseStudy });
});

export const createCaseStudy = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  ["client", "challenge", "solution", "implementation", "results", "testimonial"].forEach((k) => parseJsonField(data, k));
  data.createdBy = req.admin._id;
  const files = req.files || {};
  if (files.coverImage?.[0]) {
    const img = await uploadSingleImage(files.coverImage[0], "envalis/case-studies");
    data.coverImage = { ...img, alt: data.title };
  }
  if (files.bannerImage?.[0]) {
    const img = await uploadSingleImage(files.bannerImage[0], "envalis/case-studies");
    data.bannerImage = { ...img, alt: data.title };
  }
  if (files.gallery) {
    const imgs = await uploadMultipleImages(files.gallery, "envalis/case-studies/gallery");
    data.gallery = imgs.map((img) => ({ ...img, alt: data.title }));
  }
  if (files["client.logo"]?.[0]) {
    const logo = await uploadSingleImage(files["client.logo"][0], "envalis/client-logos");
    data.client = { ...(data.client || {}), logo };
  }
  const caseStudy = await CaseStudy.create(data);
  await createAuditLog({ action: "CREATE", entity: "CaseStudy", entityId: caseStudy._id, entityName: caseStudy.title, performedBy: req.admin, description: `Case Study created: ${caseStudy.title}` });
  successResponse(res, { caseStudy }, "Case Study created successfully", 201);
});

export const updateCaseStudy = asyncHandler(async (req, res) => {
  const caseStudy = await CaseStudy.findOne({ _id: req.params.id, isDeleted: false });
  if (!caseStudy) return errorResponse(res, "Case Study not found", 404);
  const data = { ...req.body };
  ["client", "challenge", "solution", "implementation", "results", "testimonial"].forEach((k) => parseJsonField(data, k));
  const files = req.files || {};
  if (files.coverImage?.[0]) {
    if (caseStudy.coverImage?.publicId) await deleteMedia(caseStudy.coverImage.publicId).catch(() => {});
    const img = await uploadSingleImage(files.coverImage[0], "envalis/case-studies");
    data.coverImage = { ...img, alt: data.title || caseStudy.title };
  }
  if (files.bannerImage?.[0]) {
    if (caseStudy.bannerImage?.publicId) await deleteMedia(caseStudy.bannerImage.publicId).catch(() => {});
    const img = await uploadSingleImage(files.bannerImage[0], "envalis/case-studies");
    data.bannerImage = { ...img, alt: data.title || caseStudy.title };
  }
  Object.assign(caseStudy, { ...data, updatedBy: req.admin._id });
  await caseStudy.save();
  await createAuditLog({ action: "UPDATE", entity: "CaseStudy", entityId: caseStudy._id, entityName: caseStudy.title, performedBy: req.admin, description: `Case Study updated` });
  successResponse(res, { caseStudy }, "Case Study updated successfully");
});

export const deleteCaseStudy = asyncHandler(async (req, res) => {
  const caseStudy = await CaseStudy.findOne({ _id: req.params.id, isDeleted: false });
  if (!caseStudy) return errorResponse(res, "Case Study not found", 404);
  await CaseStudy.findByIdAndUpdate(caseStudy._id, { isDeleted: true, deletedAt: new Date() });
  await createAuditLog({ action: "DELETE", entity: "CaseStudy", entityId: caseStudy._id, entityName: caseStudy.title, performedBy: req.admin, description: `Case Study deleted` });
  successResponse(res, {}, "Case Study deleted successfully");
});

export const publishCaseStudy = asyncHandler(async (req, res) => {
  const cs = await CaseStudy.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { status: "published", publishedAt: new Date(), updatedBy: req.admin._id }, { new: true });
  if (!cs) return errorResponse(res, "Case Study not found", 404);
  successResponse(res, { caseStudy: cs }, "Case Study published successfully");
});