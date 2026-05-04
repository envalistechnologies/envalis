import Contact from "../models/Contact.js";
import { createAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, paginatedResponse } from "../utils/apiResponse.js";

export const submitContact = asyncHandler(async (req, res) => {
    const contact = await Contact.create({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
    });
    successResponse(res, { contact: { _id: contact._id } }, "Your message has been received. We'll get back to you soon.", 201);
});

export const getAllContacts = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { status, priority, source, search } = req.query;
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (source) query.source = source;
    if (search) query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
    ];
    const [contacts, total] = await Promise.all([
        Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("assignedTo", "firstName lastName email"),
        Contact.countDocuments(query),
    ]);
    paginatedResponse(res, { contacts }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getContactById = asyncHandler(async (req, res) => {
    const contact = await Contact.findOne({ _id: req.params.id, isDeleted: false })
        .populate("assignedTo", "firstName lastName email")
        .populate("notes.addedBy", "firstName lastName")
        .populate("readBy", "firstName lastName")
        .populate("repliedBy", "firstName lastName");
    if (!contact) return errorResponse(res, "Contact not found", 404);
    if (!contact.isRead) {
        contact.isRead = true;
        contact.readAt = new Date();
        contact.readBy = req.admin._id;
        if (contact.status === "new") contact.status = "read";
        await contact.save();
    }
    successResponse(res, { contact });
});

export const updateContactStatus = asyncHandler(async (req, res) => {
    const contact = await Contact.findOne({ _id: req.params.id, isDeleted: false });
    if (!contact) return errorResponse(res, "Contact not found", 404);
    const { status, priority, assignedTo, note } = req.body;
    const before = { status: contact.status, priority: contact.priority };
    if (status) contact.status = status;
    if (priority) contact.priority = priority;
    if (assignedTo) contact.assignedTo = assignedTo;
    if (note) contact.notes.push({ content: note, addedBy: req.admin._id });
    if (status === "replied" && !contact.repliedAt) {
        contact.repliedAt = new Date();
        contact.repliedBy = req.admin._id;
    }
    await contact.save();
    await createAuditLog({ action: "UPDATE", entity: "Contact", entityId: contact._id, entityName: contact.email, performedBy: req.admin, description: `Contact updated`, changes: { before, after: { status: contact.status, priority: contact.priority } } });
    successResponse(res, { contact }, "Contact updated successfully");
});

export const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findOne({ _id: req.params.id, isDeleted: false });
    if (!contact) return errorResponse(res, "Contact not found", 404);
    await Contact.findByIdAndUpdate(contact._id, { isDeleted: true, deletedAt: new Date() });
    await createAuditLog({ action: "DELETE", entity: "Contact", entityId: contact._id, entityName: contact.email, performedBy: req.admin, description: `Contact deleted: ${contact.email}` });
    successResponse(res, {}, "Contact deleted successfully");
});

export const getContactStats = asyncHandler(async (req, res) => {
    const [total, byStatus, byPriority, bySource] = await Promise.all([
        Contact.countDocuments({ isDeleted: false }),
        Contact.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
        Contact.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$priority", count: { $sum: 1 } } }]),
        Contact.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$source", count: { $sum: 1 } } }]),
    ]);
    successResponse(res, { stats: { total, byStatus, byPriority, bySource } });
});
