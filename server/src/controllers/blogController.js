import Blog from "../models/Blog.js";
import { uploadSingleImage, uploadMultipleImages, deleteMedia } from "../services/uploadService.js";
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

const parseBlogBody = (body) => {
    if (typeof body.seo === "string") {
        try { body.seo = JSON.parse(body.seo); } catch { delete body.seo; }
    }
    parseJsonArray(body, "tags");
    if (!body.scheduledAt) delete body.scheduledAt;
};

// Public
export const getPublishedBlogs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { category, tag, search, featured } = req.query;

    const query = { status: "published", isDeleted: false };
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (featured === "true") query.isFeatured = true;
    if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { excerpt: { $regex: search, $options: "i" } }, { tags: { $regex: search, $options: "i" } }];

    const sort = buildSortQuery(req.query.sortBy, req.query.sortOrder, "publishedAt");
    const [blogs, total] = await Promise.all([
        Blog.find(query).sort(sort).skip(skip).limit(limit).select("-content").populate("author", "firstName lastName avatar"),
        Blog.countDocuments(query),
    ]);
    paginatedResponse(res, { blogs }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
    const blog = await Blog.findOneAndUpdate(
        { slug: req.params.slug, status: "published", isDeleted: false },
        { $inc: { views: 1 } },
        { new: true }
    ).populate("author", "firstName lastName avatar").populate("relatedPosts", "title slug coverImage publishedAt category");
    if (!blog) return errorResponse(res, "Blog not found", 404);
    successResponse(res, { blog });
});

// Admin
export const getAllBlogs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { status, category, search } = req.query;
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { tags: { $regex: search, $options: "i" } }];

    const [blogs, total] = await Promise.all([
        Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("author", "firstName lastName"),
        Blog.countDocuments(query),
    ]);
    paginatedResponse(res, { blogs }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getBlogById = asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false }).populate("author", "firstName lastName");
    if (!blog) return errorResponse(res, "Blog not found", 404);
    successResponse(res, { blog });
});

export const createBlog = asyncHandler(async (req, res) => {
    const body = { ...req.body };
    parseBlogBody(body);
    const blogData = { ...body, author: req.admin._id, createdBy: req.admin._id };
    if (req.files?.coverImage?.[0]) {
        const img = await uploadSingleImage(req.files.coverImage[0], "envalis/blogs");
        blogData.coverImage = { ...img, alt: body.coverImageAlt || blogData.title };
    }
    if (req.files?.gallery?.length) {
        const imgs = await uploadMultipleImages(req.files.gallery, "envalis/blogs/gallery");
        blogData.gallery = imgs.map((img, i) => ({ ...img, alt: `Gallery ${i + 1}` }));
    }
    const blog = await Blog.create(blogData);
    await createAuditLog({ action: "CREATE", entity: "Blog", entityId: blog._id, entityName: blog.title, performedBy: req.admin, description: `Blog created: ${blog.title}` });
    successResponse(res, { blog }, "Blog created successfully", 201);
});

export const updateBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false });
    if (!blog) return errorResponse(res, "Blog not found", 404);
    const body = { ...req.body };
    parseBlogBody(body);
    const before = { title: blog.title, status: blog.status };

    // Handle explicit image removal (user removed image without replacing)
    if (body.removeCoverImage === "true" && !req.files?.coverImage?.[0]) {
        if (blog.coverImage?.publicId) await deleteMedia(blog.coverImage.publicId).catch(() => {});
        body.coverImage = null;
    }
    if (body.removeGalleryIds) {
        try {
            const idsToRemove = JSON.parse(body.removeGalleryIds);
            if (Array.isArray(idsToRemove) && idsToRemove.length > 0) {
                await Promise.all(idsToRemove.map((id) => deleteMedia(id).catch(() => {})));
                body.gallery = (blog.gallery || []).filter((g) => !idsToRemove.includes(g.publicId));
            }
        } catch { /* ignore parse errors */ }
    }
    delete body.removeCoverImage;
    delete body.removeGalleryIds;

    if (req.files?.coverImage?.[0]) {
        if (blog.coverImage?.publicId) await deleteMedia(blog.coverImage.publicId).catch(() => { });
        const img = await uploadSingleImage(req.files.coverImage[0], "envalis/blogs");
        body.coverImage = { ...img, alt: body.coverImageAlt || blog.title };
    }
    if (req.files?.gallery?.length) {
        const imgs = await uploadMultipleImages(req.files.gallery, "envalis/blogs/gallery");
        const newItems = imgs.map((img, i) => ({ ...img, alt: `Gallery ${i + 1}` }));
        body.gallery = [...(blog.gallery || []), ...newItems];
    }
    Object.assign(blog, { ...body, updatedBy: req.admin._id });
    await blog.save();
    await createAuditLog({ action: "UPDATE", entity: "Blog", entityId: blog._id, entityName: blog.title, performedBy: req.admin, description: `Blog updated`, changes: { before, after: { title: blog.title, status: blog.status } } });
    successResponse(res, { blog }, "Blog updated successfully");
});

export const deleteBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false });
    if (!blog) return errorResponse(res, "Blog not found", 404);
    await Blog.findByIdAndUpdate(blog._id, { isDeleted: true, deletedAt: new Date() });
    await createAuditLog({ action: "DELETE", entity: "Blog", entityId: blog._id, entityName: blog.title, performedBy: req.admin, description: `Blog deleted: ${blog.title}` });
    successResponse(res, {}, "Blog deleted successfully");
});

export const publishBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { status: "published", publishedAt: new Date(), updatedBy: req.admin._id }, { new: true });
    if (!blog) return errorResponse(res, "Blog not found", 404);
    await createAuditLog({ action: "PUBLISH", entity: "Blog", entityId: blog._id, entityName: blog.title, performedBy: req.admin, description: `Blog published: ${blog.title}` });
    successResponse(res, { blog }, "Blog published successfully");
});

export const unpublishBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { status: "draft", updatedBy: req.admin._id }, { new: true });
    if (!blog) return errorResponse(res, "Blog not found", 404);
    await createAuditLog({ action: "UNPUBLISH", entity: "Blog", entityId: blog._id, entityName: blog.title, performedBy: req.admin, description: `Blog unpublished` });
    successResponse(res, { blog }, "Blog unpublished successfully");
});

export const getBlogStats = asyncHandler(async (req, res) => {
    const [total, byStatus, byCategory, topViewed] = await Promise.all([
        Blog.countDocuments({ isDeleted: false }),
        Blog.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
        Blog.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
        Blog.find({ isDeleted: false, status: "published" }).sort({ views: -1 }).limit(5).select("title views slug"),
    ]);
    successResponse(res, { stats: { total, byStatus, byCategory, topViewed } });
});