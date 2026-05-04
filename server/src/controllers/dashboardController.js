import Blog from "../models/Blog.js";
import Article from "../models/Article.js";
import Employee from "../models/Employee.js";
import Career from "../models/Career.js";
import Project from "../models/Project.js";
import Contact from "../models/Contact.js";
import Testimonial from "../models/Testimonial.js";
import Resource from "../models/Resource.js";
import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function countsFromAgg(agg) {
    const map = {};
    for (const item of agg) {
        map[`${item._id.year}-${item._id.month}`] = item.count;
    }
    return map;
}

function buildMonthlyTrend(blogCounts, articleCounts, contactCounts) {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        return {
            month: MONTHS[d.getMonth()],
            blogs: blogCounts[key] || 0,
            articles: articleCounts[key] || 0,
            contacts: contactCounts[key] || 0,
        };
    });
}

export const getDashboard = asyncHandler(async (req, res) => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyPipeline = (extraMatch = {}) => [
        { $match: { ...extraMatch, createdAt: { $gte: twelveMonthsAgo } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ];

    const [
        totalBlogs,
        publishedBlogs,
        blogsByCategory,
        blogMonthly,
        totalArticles,
        articleMonthly,
        totalEmployees,
        activeEmployees,
        activeCareers,
        careerApplicationsAgg,
        totalContacts,
        newContacts,
        contactMonthly,
        totalProjects,
        inProgressProjects,
        projectsByStatus,
        approvedTestimonials,
        pendingTestimonials,
        totalResources,
        recentBlogs,
        recentContacts,
        recentAuditLogs,
    ] = await Promise.all([
        Blog.countDocuments({ isDeleted: false }),
        Blog.countDocuments({ isDeleted: false, status: "published" }),
        Blog.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
            { $project: { _id: 0, category: "$_id", count: 1 } },
        ]),
        Blog.aggregate(monthlyPipeline({ isDeleted: false })),
        Article.countDocuments({ isDeleted: false }),
        Article.aggregate(monthlyPipeline({ isDeleted: false })),
        Employee.countDocuments({ isDeleted: false }),
        Employee.countDocuments({ isDeleted: false, status: "active" }),
        Career.countDocuments({ isDeleted: false, status: "active" }),
        Career.aggregate([
            { $match: { isDeleted: false } },
            { $project: { applicationCount: { $size: { $ifNull: ["$applications", []] } } } },
            { $group: { _id: null, total: { $sum: "$applicationCount" } } },
        ]),
        Contact.countDocuments({ isDeleted: false }),
        Contact.countDocuments({ isDeleted: false, status: "new" }),
        Contact.aggregate(monthlyPipeline({ isDeleted: false })),
        Project.countDocuments({ isDeleted: false }),
        Project.countDocuments({ isDeleted: false, status: "in_progress" }),
        Project.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } },
        ]),
        Testimonial.countDocuments({ isDeleted: false, status: "approved" }),
        Testimonial.countDocuments({ isDeleted: false, status: "pending" }),
        Resource.countDocuments({ isDeleted: false }),
        Blog.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("title status category views coverImage createdAt")
            .lean(),
        Contact.find({ isDeleted: false, status: "new" })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email subject createdAt")
            .lean(),
        AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(8)
            .select("performedBy action description severity createdAt")
            .lean(),
    ]);

    const monthlyTrend = buildMonthlyTrend(
        countsFromAgg(blogMonthly),
        countsFromAgg(articleMonthly),
        countsFromAgg(contactMonthly)
    );

    successResponse(res, {
        blogs: {
            total: totalBlogs,
            published: publishedBlogs,
            byCategory: blogsByCategory,
            monthlyTrend,
        },
        articles: { total: totalArticles },
        employees: {
            total: totalEmployees,
            active: activeEmployees,
        },
        careers: {
            active: activeCareers,
            totalApplications: careerApplicationsAgg[0]?.total ?? 0,
        },
        contacts: {
            total: totalContacts,
            new: newContacts,
        },
        projects: {
            total: totalProjects,
            inProgress: inProgressProjects,
            byStatus: projectsByStatus,
        },
        testimonials: {
            approved: approvedTestimonials,
            pending: pendingTestimonials,
        },
        resources: { total: totalResources },
        recentBlogs,
        recentContacts,
        recentAuditLogs,
    });
});
