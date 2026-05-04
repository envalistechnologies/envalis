import {
    House, ChartBar, Article, FileText, Briefcase, FileMagnifyingGlass, Star, Headset,
    Folder, Users, Kanban, Buildings, Envelope, Phone, ClipboardText,
    ShieldCheck, UserCircle, EnvelopeOpen, Notepad, Gear,
} from "@phosphor-icons/react";

export const navGroups = [
    {
        label: "Overview",
        items: [
            { label: "Dashboard", icon: House, path: "/dashboard" },
            { label: "Analytics", icon: ChartBar, path: "/analytics" },
        ],
    },
    {
        label: "Content",
        items: [
            { label: "Blogs", icon: Article, path: "/blogs", perm: ["blogs", "read"] },
            { label: "Articles", icon: FileText, path: "/articles", perm: ["articles", "read"] },
            { label: "Portfolios", icon: Briefcase, path: "/portfolios", perm: ["portfolios", "read"] },
            { label: "Case Studies", icon: FileMagnifyingGlass, path: "/case-studies", perm: ["caseStudies", "read"] },
            { label: "Testimonials", icon: Star, path: "/testimonials", perm: ["testimonials", "read"] },
            { label: "Services", icon: Headset, path: "/services", perm: ["services", "read"] },
            { label: "Resources", icon: Folder, path: "/resources", perm: ["resources", "read"] },
        ],
    },
    {
        label: "Operations",
        items: [
            { label: "Projects", icon: Kanban, path: "/projects", perm: ["projects", "read"] },
            { label: "Employees", icon: Users, path: "/employees", perm: ["employees", "read"] },
            { label: "Careers", icon: Buildings, path: "/careers", perm: ["careers", "read"] },
            { label: "Contacts", icon: Phone, path: "/contacts", perm: ["contacts", "read"] },
        ],
    },
    {
        label: "Communication",
        items: [
            { label: "Send Email", icon: Envelope, path: "/emails/send", perm: ["emails", "send"] },
            { label: "Email Templates", icon: Notepad, path: "/emails/templates", perm: ["emails", "send"] },
            { label: "Email Logs", icon: EnvelopeOpen, path: "/emails/logs", perm: ["emails", "send"] },
        ],
    },
    {
        label: "Administration",
        items: [
            { label: "Admins", icon: ShieldCheck, path: "/admins", roles: ["super_admin"] },
            { label: "Audit Logs", icon: ClipboardText, path: "/audit-logs", perm: ["auditLogs", "read"] },
        ],
    },
    {
        label: "Account",
        items: [
            { label: "My Profile", icon: UserCircle, path: "/profile" },
            { label: "Settings", icon: Gear, path: "/settings" },
        ],
    },
];