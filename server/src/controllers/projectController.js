import Project from "../models/Project.js";
import { createAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, buildSortQuery, paginatedResponse } from "../utils/apiResponse.js";

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

const parseProjectBody = (body) => {
    ["clientContact", "budget"].forEach((k) => parseJsonField(body, k));
    ["milestones", "technologies", "tags", "teamMembers", "tasks"].forEach((k) => parseJsonArray(body, k));
};

export const getAllProjects = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { status, category, priority, search } = req.query;
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) query.$or = [
        { name: { $regex: search, $options: "i" } },
        { client: { $regex: search, $options: "i" } },
        { projectId: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
    ];
    const sort = buildSortQuery(req.query.sortBy, req.query.sortOrder, "createdAt");
    const [projects, total] = await Promise.all([
        Project.find(query).sort(sort).skip(skip).limit(limit)
            .populate("projectManager", "firstName lastName email")
            .populate("teamMembers.employee", "firstName lastName email"),
        Project.countDocuments(query),
    ]);
    paginatedResponse(res, { projects }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findOne({ _id: req.params.id, isDeleted: false })
        .populate("projectManager", "firstName lastName email")
        .populate("teamMembers.employee", "firstName lastName email")
        .populate("tasks.assignedTo", "firstName lastName email")
        .populate("portfolioRef", "title slug");
    if (!project) return errorResponse(res, "Project not found", 404);
    successResponse(res, { project });
});

export const createProject = asyncHandler(async (req, res) => {
    const data = { ...req.body, createdBy: req.admin._id };
    parseProjectBody(data);
    const project = await Project.create(data);
    await createAuditLog({ action: "CREATE", entity: "Project", entityId: project._id, entityName: project.name, performedBy: req.admin, description: `Project created: ${project.name}` });
    successResponse(res, { project }, "Project created successfully", 201);
});

export const updateProject = asyncHandler(async (req, res) => {
    const project = await Project.findOne({ _id: req.params.id, isDeleted: false });
    if (!project) return errorResponse(res, "Project not found", 404);
    const before = { name: project.name, status: project.status, progress: project.progress };
    const body = { ...req.body };
    parseProjectBody(body);
    Object.assign(project, { ...body, updatedBy: req.admin._id });
    await project.save();
    await createAuditLog({ action: "UPDATE", entity: "Project", entityId: project._id, entityName: project.name, performedBy: req.admin, description: `Project updated`, changes: { before, after: { name: project.name, status: project.status, progress: project.progress } } });
    successResponse(res, { project }, "Project updated successfully");
});

export const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findOne({ _id: req.params.id, isDeleted: false });
    if (!project) return errorResponse(res, "Project not found", 404);
    await Project.findByIdAndUpdate(project._id, { isDeleted: true, deletedAt: new Date() });
    await createAuditLog({ action: "DELETE", entity: "Project", entityId: project._id, entityName: project.name, performedBy: req.admin, description: `Project deleted: ${project.name}` });
    successResponse(res, {}, "Project deleted successfully");
});

export const getProjectStats = asyncHandler(async (req, res) => {
    const [total, byStatus, byCategory, byPriority] = await Promise.all([
        Project.countDocuments({ isDeleted: false }),
        Project.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
        Project.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
        Project.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$priority", count: { $sum: 1 } } }]),
    ]);
    successResponse(res, { stats: { total, byStatus, byCategory, byPriority } });
});
