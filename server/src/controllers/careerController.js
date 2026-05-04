import Career from "../models/Career.js";
import { uploadResume } from "../services/uploadService.js";
import { sendEmail } from "../services/emailService.js";
import { createAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, buildPaginationQuery, paginatedResponse } from "../utils/apiResponse.js";

// Public
export const getActiveJobs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { department, type, location, search, featured } = req.query;
    const query = { status: "active", isDeleted: false };
    if (department) query.department = department;
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: "i" };
    if (featured === "true") query.isFeatured = true;
    if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }, { skills: { $regex: search, $options: "i" } }];

    const [jobs, total] = await Promise.all([
        Career.find(query).sort({ isFeatured: -1, isUrgent: -1, createdAt: -1 }).skip(skip).limit(limit).select("-applications"),
        Career.countDocuments(query),
    ]);
    paginatedResponse(res, { jobs }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getJobBySlug = asyncHandler(async (req, res) => {
    const job = await Career.findOneAndUpdate(
        { slug: req.params.slug, status: "active", isDeleted: false },
        { $inc: { views: 1 } },
        { new: true }
    ).select("-applications");
    if (!job) return errorResponse(res, "Job not found", 404);
    successResponse(res, { job });
});

export const applyForJob = asyncHandler(async (req, res) => {
    const job = await Career.findOne({ _id: req.params.id, status: "active", isDeleted: false });
    if (!job) return errorResponse(res, "Job not found or no longer accepting applications", 404);
    if (job.applicationDeadline && new Date() > job.applicationDeadline) return errorResponse(res, "Application deadline has passed", 400);

    const { applicantName, applicantEmail, applicantPhone, coverLetter, linkedinUrl, portfolioUrl } = req.body;
    const existing = job.applications.find((a) => a.applicantEmail === applicantEmail);
    if (existing) return errorResponse(res, "You have already applied for this position", 400);

    let resumeData = {};
    if (req.file) {
        const doc = await uploadResume(req.file);
        resumeData = { resumeUrl: doc.url, resumePublicId: doc.publicId };
    } else if (!req.body.resumeUrl) {
        return errorResponse(res, "Resume is required", 400);
    }

    job.applications.push({ applicantName, applicantEmail, applicantPhone, coverLetter, linkedinUrl, portfolioUrl, ...resumeData, appliedAt: new Date() });
    await job.save();

    // Auto-reply email
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <h2 style="color:#1a1a2e;">Application Received!</h2>
    <p>Dear ${applicantName},</p>
    <p>Thank you for applying for <strong>${job.title}</strong> at Envalis Technologies.</p>
    <p>We have received your application and will review it carefully. If your profile matches our requirements, we'll reach out to you soon.</p>
    <p>Best regards,<br/><strong>Envalis Technologies HR Team</strong></p>
  </div>`;
    await sendEmail({ to: applicantEmail, subject: `Application Received - ${job.title} | Envalis Technologies`, html, category: "hr_notice" }).catch(() => { });

    successResponse(res, {}, "Application submitted successfully! You'll hear from us soon.", 201);
});

// Admin
export const getAllJobs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPaginationQuery(req.query);
    const { status, department, search } = req.query;
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (department) query.department = department;
    if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { jobId: { $regex: search, $options: "i" } }];

    const [jobs, total] = await Promise.all([
        Career.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-applications.coverLetter"),
        Career.countDocuments(query),
    ]);
    paginatedResponse(res, { jobs }, { total, page, pages: Math.ceil(total / limit), limit });
});

export const getJobById = asyncHandler(async (req, res) => {
    const job = await Career.findOne({ _id: req.params.id, isDeleted: false });
    if (!job) return errorResponse(res, "Job not found", 404);
    successResponse(res, { job });
});

export const createJob = asyncHandler(async (req, res) => {
    const job = await Career.create({ ...req.body, createdBy: req.admin._id });
    await createAuditLog({ action: "CREATE", entity: "Career", entityId: job._id, entityName: job.title, performedBy: req.admin, description: `Job posting created: ${job.title}` });
    successResponse(res, { job }, "Job created successfully", 201);
});

export const updateJob = asyncHandler(async (req, res) => {
    const job = await Career.findOne({ _id: req.params.id, isDeleted: false });
    if (!job) return errorResponse(res, "Job not found", 404);
    Object.assign(job, { ...req.body, updatedBy: req.admin._id });
    await job.save();
    await createAuditLog({ action: "UPDATE", entity: "Career", entityId: job._id, entityName: job.title, performedBy: req.admin, description: `Job updated` });
    successResponse(res, { job }, "Job updated successfully");
});

export const deleteJob = asyncHandler(async (req, res) => {
    const job = await Career.findOne({ _id: req.params.id, isDeleted: false });
    if (!job) return errorResponse(res, "Job not found", 404);
    await Career.findByIdAndUpdate(job._id, { isDeleted: true, deletedAt: new Date() });
    await createAuditLog({ action: "DELETE", entity: "Career", entityId: job._id, entityName: job.title, performedBy: req.admin, description: `Job deleted` });
    successResponse(res, {}, "Job deleted successfully");
});

export const getApplications = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const job = await Career.findOne({ _id: req.params.id, isDeleted: false });
    if (!job) return errorResponse(res, "Job not found", 404);
    let applications = job.applications;
    if (status) applications = applications.filter((a) => a.status === status);
    applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    successResponse(res, { applications, total: applications.length });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status, notes, interviewDate } = req.body;
    const job = await Career.findOne({ _id: req.params.id, isDeleted: false });
    if (!job) return errorResponse(res, "Job not found", 404);
    const application = job.applications.id(req.params.appId);
    if (!application) return errorResponse(res, "Application not found", 404);

    const oldStatus = application.status;
    application.status = status;
    if (notes) application.notes = notes;
    if (interviewDate) application.interviewDate = interviewDate;
    application.reviewedBy = req.admin._id;
    application.reviewedAt = new Date();
    await job.save();

    // Notify applicant
    const statusMessages = {
        shortlisted: "You have been shortlisted for the next round.",
        interview: `You have been invited for an interview${interviewDate ? ` on ${new Date(interviewDate).toLocaleDateString()}` : ""}.`,
        selected: "Congratulations! You have been selected for the position.",
        rejected: "After careful consideration, we have decided to move forward with other candidates.",
    };

    if (statusMessages[status]) {
        const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a1a2e;">Application Update - ${job.title}</h2>
      <p>Dear ${application.applicantName},</p>
      <p>${statusMessages[status]}</p>
      ${notes ? `<p><strong>Note:</strong> ${notes}</p>` : ""}
            <p>Best regards,<br/><strong>Envalis Technologies HR Team</strong></p>
    </div>`;
                await sendEmail({ to: application.applicantEmail, subject: `Application Update - ${job.title} | Envalis Technologies`, html, category: "hr_notice" }).catch(() => { });
    }

    await createAuditLog({ action: "APPLICATION_STATUS_CHANGED", entity: "Career", entityId: job._id, entityName: `${job.title} - ${application.applicantName}`, performedBy: req.admin, description: `Application status changed from ${oldStatus} to ${status}` });
    successResponse(res, { application }, "Application status updated");
});

export const getCareerStats = asyncHandler(async (req, res) => {
    const [totalJobs, byStatus, totalApplications] = await Promise.all([
        Career.countDocuments({ isDeleted: false }),
        Career.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
        Career.aggregate([{ $match: { isDeleted: false } }, { $unwind: "$applications" }, { $group: { _id: "$applications.status", count: { $sum: 1 } } }]),
    ]);
    successResponse(res, { stats: { totalJobs, byStatus, totalApplications } });
});