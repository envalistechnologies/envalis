import Service from "../models/Service.js";
import { uploadSingleImage, deleteMedia } from "../services/uploadService.js";
import { createAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, buildSortQuery, paginatedResponse } from "../utils/apiResponse.js";

const parseJsonField = (obj, key) => {
    if (typeof obj[key] === "string") {
        try {
            const parsed = JSON.parse(obj[key]);
            if (typeof parsed === "object" && parsed !== null) obj[key] = parsed;
        } catch {
            // Keep original value if it is not valid JSON.
        }
    }
};

const parseJsonArray = (obj, key) => {
    if (typeof obj[key] === "string") {
        try {
            const parsed = JSON.parse(obj[key]);
            if (Array.isArray(parsed)) obj[key] = parsed;
        } catch {
            // Keep original value if it is not valid JSON.
        }
    }
    // Ensure single values are wrapped in an array for array fields
    if (obj[key] !== undefined && !Array.isArray(obj[key]) && typeof obj[key] === "string" && obj[key] !== "[]") {
        obj[key] = [obj[key]];
    }
};

export const getPublishedServices = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { search, featured } = req.query;
    const query = { status: "published", isDeleted: false };
    if (featured === "true") query.isFeatured = true;
    if (search) query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
    ];
    const sort = buildSortQuery(req.query.sortBy, req.query.sortOrder, "createdAt");
    const [services, total] = await Promise.all([
        Service.find(query).sort(sort).skip(skip).limit(limit).select("-content"),
        Service.countDocuments(query),
    ]);
    paginatedResponse(res, { services }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getServiceBySlug = asyncHandler(async (req, res) => {
    const service = await Service.findOneAndUpdate(
        { slug: req.params.slug, status: "published", isDeleted: false },
        { $inc: { views: 1 } },
        { new: true }
    );
    if (!service) return errorResponse(res, "Service not found", 404);
    successResponse(res, { service });
});

export const getAllServices = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { status, search } = req.query;
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (search) query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
    ];
    const [services, total] = await Promise.all([
        Service.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Service.countDocuments(query),
    ]);
    paginatedResponse(res, { services }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findOne({ _id: req.params.id, isDeleted: false });
    if (!service) return errorResponse(res, "Service not found", 404);
    successResponse(res, { service });
});

export const createService = asyncHandler(async (req, res) => {
    const serviceData = { ...req.body, createdBy: req.admin._id };
    ["features", "pricing", "process", "faqs", "tags", "technologies"].forEach((k) => parseJsonArray(serviceData, k));
    if (!serviceData.excerpt) {
        serviceData.excerpt = serviceData.shortDescription || serviceData.description || "";
    }
    if (!serviceData.content) {
        serviceData.content = serviceData.description || "";
    }
    console.log("[ServiceController] Creating service:", { title: serviceData.title, contentLength: serviceData.content?.length || 0, hasBlockquote: serviceData.content?.includes("<blockquote") || false });
    if (req.files?.coverImage?.[0]) {
        const img = await uploadSingleImage(req.files.coverImage[0], "envalis/services");
        serviceData.coverImage = { ...img, alt: req.body.coverImageAlt || serviceData.title };
    }
    if (req.files?.bannerImage?.[0]) {
        const img = await uploadSingleImage(req.files.bannerImage[0], "envalis/services");
        serviceData.bannerImage = { ...img, alt: req.body.bannerImageAlt || serviceData.title };
    }
    const service = await Service.create(serviceData);
    await createAuditLog({ action: "CREATE", entity: "Service", entityId: service._id, entityName: service.title, performedBy: req.admin, description: `Service created: ${service.title}` });
    successResponse(res, { service }, "Service created successfully", 201);
});

export const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findOne({ _id: req.params.id, isDeleted: false });
    if (!service) return errorResponse(res, "Service not found", 404);
    const body = { ...req.body };
    ["features", "pricing", "process", "faqs", "tags", "technologies"].forEach((k) => parseJsonArray(body, k));
    if (!body.excerpt) {
        body.excerpt = body.shortDescription || body.description || service.excerpt;
    }
    if (!body.content) {
        body.content = body.description || service.content;
    }
    console.log("[ServiceController] Updating service:", { title: service.title, newContentLength: body.content?.length || 0, hasBlockquote: body.content?.includes("<blockquote") || false });
    const before = { title: service.title, status: service.status };

    // Handle explicit image removal (user removed image without replacing)
    if (body.removeCoverImage === "true" && !req.files?.coverImage?.[0]) {
        if (service.coverImage?.publicId) await deleteMedia(service.coverImage.publicId).catch(() => {});
        body.coverImage = null;
    }
    if (body.removeBannerImage === "true" && !req.files?.bannerImage?.[0]) {
        if (service.bannerImage?.publicId) await deleteMedia(service.bannerImage.publicId).catch(() => {});
        body.bannerImage = null;
    }
    delete body.removeCoverImage;
    delete body.removeBannerImage;

    if (req.files?.coverImage?.[0]) {
        if (service.coverImage?.publicId) await deleteMedia(service.coverImage.publicId).catch(() => {});
        const img = await uploadSingleImage(req.files.coverImage[0], "envalis/services");
        body.coverImage = { ...img, alt: body.coverImageAlt || service.title };
    }
    if (req.files?.bannerImage?.[0]) {
        if (service.bannerImage?.publicId) await deleteMedia(service.bannerImage.publicId).catch(() => {});
        const img = await uploadSingleImage(req.files.bannerImage[0], "envalis/services");
        body.bannerImage = { ...img, alt: body.bannerImageAlt || service.title };
    }
    Object.assign(service, { ...body, updatedBy: req.admin._id });
    await service.save();
    await createAuditLog({ action: "UPDATE", entity: "Service", entityId: service._id, entityName: service.title, performedBy: req.admin, description: `Service updated`, changes: { before, after: { title: service.title, status: service.status } } });
    successResponse(res, { service }, "Service updated successfully");
});

export const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findOne({ _id: req.params.id, isDeleted: false });
    if (!service) return errorResponse(res, "Service not found", 404);
    await Service.findByIdAndUpdate(service._id, { isDeleted: true, deletedAt: new Date() });
    await createAuditLog({ action: "DELETE", entity: "Service", entityId: service._id, entityName: service.title, performedBy: req.admin, description: `Service deleted: ${service.title}` });
    successResponse(res, {}, "Service deleted successfully");
});
