import Resource from "../models/Resource.js";
import { uploadSingleImage, uploadDocument, deleteMedia } from "../services/uploadService.js";
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
    if (obj[key] !== undefined && !Array.isArray(obj[key]) && typeof obj[key] === "string") {
        obj[key] = [obj[key]];
    }
};

const parseResourceBody = (body) => {
    parseJsonArray(body, "tags");
    // Convert string booleans from FormData
    ["isFree", "requiresEmail", "isFeatured"].forEach((k) => {
        if (typeof body[k] === "string") body[k] = body[k] === "true";
    });
};

export const getPublishedResources = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { type, category, search, featured } = req.query;
    const query = { status: "published", isDeleted: false };
    if (type) query.type = type;
    if (category) query.category = category;
    if (featured === "true") query.isFeatured = true;
    if (search) query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
    ];
    const sort = buildSortQuery(req.query.sortBy, req.query.sortOrder, "publishedAt");
    const [resources, total] = await Promise.all([
        Resource.find(query).sort(sort).skip(skip).limit(limit).select("-content"),
        Resource.countDocuments(query),
    ]);
    paginatedResponse(res, { resources }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getResourceBySlug = asyncHandler(async (req, res) => {
    const resource = await Resource.findOneAndUpdate(
        { slug: req.params.slug, status: "published", isDeleted: false },
        { $inc: { views: 1 } },
        { new: true }
    );
    if (!resource) return errorResponse(res, "Resource not found", 404);
    successResponse(res, { resource });
});

export const getAllResources = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { status, type, category, search } = req.query;
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
    ];
    const [resources, total] = await Promise.all([
        Resource.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Resource.countDocuments(query),
    ]);
    paginatedResponse(res, { resources }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getResourceById = asyncHandler(async (req, res) => {
    const resource = await Resource.findOne({ _id: req.params.id, isDeleted: false });
    if (!resource) return errorResponse(res, "Resource not found", 404);
    successResponse(res, { resource });
});

export const createResource = asyncHandler(async (req, res) => {
    const resourceData = { ...req.body, createdBy: req.admin._id };
    parseResourceBody(resourceData);
    if (req.files?.coverImage?.[0]) {
        const img = await uploadSingleImage(req.files.coverImage[0], "envalis/resources");
        resourceData.coverImage = { ...img, alt: req.body.coverImageAlt || resourceData.title };
    }
    if (req.files?.file?.[0]) {
        const doc = await uploadDocument(req.files.file[0], "envalis/resources");
        resourceData.file = { url: doc.url, publicId: doc.publicId, name: req.files.file[0].originalname, size: req.files.file[0].size, format: doc.format };
    }
    const resource = await Resource.create(resourceData);
    await createAuditLog({ action: "CREATE", entity: "Resource", entityId: resource._id, entityName: resource.title, performedBy: req.admin, description: `Resource created: ${resource.title}` });
    successResponse(res, { resource }, "Resource created successfully", 201);
});

export const updateResource = asyncHandler(async (req, res) => {
    const resource = await Resource.findOne({ _id: req.params.id, isDeleted: false });
    if (!resource) return errorResponse(res, "Resource not found", 404);
    const before = { title: resource.title, status: resource.status };
    const body = { ...req.body };
    parseResourceBody(body);

    // Handle explicit image removal (user removed image without replacing)
    if (body.removeCoverImage === "true" && !req.files?.coverImage?.[0]) {
        if (resource.coverImage?.publicId) await deleteMedia(resource.coverImage.publicId).catch(() => {});
        body.coverImage = null;
    }
    delete body.removeCoverImage;

    if (req.files?.coverImage?.[0]) {
        if (resource.coverImage?.publicId) await deleteMedia(resource.coverImage.publicId).catch(() => {});
        const img = await uploadSingleImage(req.files.coverImage[0], "envalis/resources");
        body.coverImage = { ...img, alt: body.coverImageAlt || resource.title };
    }
    if (req.files?.file?.[0]) {
        if (resource.file?.publicId) await deleteMedia(resource.file.publicId).catch(() => {});
        const doc = await uploadDocument(req.files.file[0], "envalis/resources");
        body.file = { url: doc.url, publicId: doc.publicId, name: req.files.file[0].originalname, size: req.files.file[0].size, format: doc.format };
    }
    Object.assign(resource, { ...body, updatedBy: req.admin._id });
    await resource.save();
    await createAuditLog({ action: "UPDATE", entity: "Resource", entityId: resource._id, entityName: resource.title, performedBy: req.admin, description: `Resource updated`, changes: { before, after: { title: resource.title, status: resource.status } } });
    successResponse(res, { resource }, "Resource updated successfully");
});

export const deleteResource = asyncHandler(async (req, res) => {
    const resource = await Resource.findOne({ _id: req.params.id, isDeleted: false });
    if (!resource) return errorResponse(res, "Resource not found", 404);
    await Resource.findByIdAndUpdate(resource._id, { isDeleted: true, deletedAt: new Date() });
    await createAuditLog({ action: "DELETE", entity: "Resource", entityId: resource._id, entityName: resource.title, performedBy: req.admin, description: `Resource deleted: ${resource.title}` });
    successResponse(res, {}, "Resource deleted successfully");
});
