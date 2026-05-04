import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
    // Content
    published: { label: "Published", variant: "success" },
    draft: { label: "Draft", variant: "secondary" },
    archived: { label: "Archived", variant: "outline" },
    scheduled: { label: "Scheduled", variant: "warning" },
    // Employees
    active: { label: "Active", variant: "success" },
    on_leave: { label: "On Leave", variant: "warning" },
    resigned: { label: "Resigned", variant: "destructive" },
    terminated: { label: "Terminated", variant: "destructive" },
    // Projects
    planning: { label: "Planning", variant: "secondary" },
    in_progress: { label: "In Progress", variant: "default" },
    review: { label: "Review", variant: "warning" },
    on_hold: { label: "On Hold", variant: "outline" },
    completed: { label: "Completed", variant: "success" },
    cancelled: { label: "Cancelled", variant: "destructive" },
    delivered: { label: "Delivered", variant: "success" },
    // Jobs
    "active-job": { label: "Active", variant: "success" },
    paused: { label: "Paused", variant: "warning" },
    closed: { label: "Closed", variant: "outline" },
    filled: { label: "Filled", variant: "success" },
    // Testimonials
    pending: { label: "Pending", variant: "warning" },
    approved: { label: "Approved", variant: "success" },
    rejected: { label: "Rejected", variant: "destructive" },
    // Applications
    reviewing: { label: "Reviewing", variant: "default" },
    shortlisted: { label: "Shortlisted", variant: "warning" },
    interview: { label: "Interview", variant: "default" },
    selected: { label: "Selected", variant: "success" },
    withdrawn: { label: "Withdrawn", variant: "outline" },
    // Contacts
    new: { label: "New", variant: "default" },
    read: { label: "Read", variant: "secondary" },
    replied: { label: "Replied", variant: "success" },
    spam: { label: "Spam", variant: "destructive" },
    // Priority
    low: { label: "Low", variant: "secondary" },
    medium: { label: "Medium", variant: "warning" },
    high: { label: "High", variant: "destructive" },
    critical: { label: "Critical", variant: "destructive" },
};

const StatusBadge = ({ status, className }) => {
    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return (
        <Badge variant={config.variant} className={cn("capitalize", className)}>
            {config.label}
        </Badge>
    );
};

export default StatusBadge;