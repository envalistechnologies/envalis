import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
    Users, Article, Briefcase, Star, Buildings, Phone, FileMagnifyingGlassIcon, Folder,
    Kanban, ShieldCheck, Plus, ArrowRight, Eye, Calendar, ChartLineUp,
} from "@phosphor-icons/react";
import {
    AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    Tooltip as ReTooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

import { useAuth } from "@/store/authStore";
import { dashboardAPI } from "@/api/dashboardApi";

import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatesCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials, formatRelative, humanize } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const Dashboard = () => {
    const { admin } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ["dashboard"],
        queryFn: () => dashboardAPI.get().then((r) => r.data),
        staleTime: 2 * 60 * 1000,
    });

    const blogsData = data?.blogs;
    const articlesData = data?.articles;
    const employeesData = data?.employees;
    const careersData = data?.careers;
    const contactsData = data?.contacts;
    const projectsData = data?.projects;
    const testimonialsData = data?.testimonials;
    const resourcesData = data?.resources;
    const auditLogs = data?.recentAuditLogs ?? [];
    const recentBlogs = data?.recentBlogs ?? [];
    const recentContacts = data?.recentContacts ?? [];

    const trendData = blogsData?.monthlyTrend ?? Array.from({ length: 12 }, (_, i) => ({
        month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
        blogs: 0, articles: 0, contacts: 0,
    }));
    const categoryData = blogsData?.byCategory ?? [];
    const projectStatus = projectsData?.byStatus ?? [];

    const quickActions = [
        { label: "New Blog", icon: Article, to: "/blogs/new", color: "bg-blue-500/10 text-blue-600" },
        { label: "New Project", icon: Kanban, to: "/projects/new", color: "bg-purple-500/10 text-purple-600" },
        { label: "Add Employee", icon: Users, to: "/employees/new", color: "bg-emerald-500/10 text-emerald-600" },
        { label: "Post a Job", icon: Buildings, to: "/careers/new", color: "bg-amber-500/10 text-amber-600" },
        { label: "Send Email", icon: Star, to: "/emails/send", color: "bg-rose-500/10 text-rose-600" },
        { label: "Add Service", icon: ShieldCheck, to: "/services/new", color: "bg-cyan-500/10 text-cyan-600" },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome back, ${admin?.firstName ?? "Admin"} 👋`}
                description="Here's what's happening across Enovalis today."
                actions={
                    <Button asChild variant="outline">
                        <Link to="/analytics"><ChartLineUp size={16} className="mr-1.5" /> View Analytics</Link>
                    </Button>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Blogs"
                    value={blogsData?.total ?? 0}
                    description={`${blogsData?.published ?? 0} published`}
                    icon={Article}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-500/10"
                    loading={isLoading}
                />
                <StatsCard
                    title="Active Employees"
                    value={employeesData?.active ?? 0}
                    description={`${employeesData?.total ?? 0} total`}
                    icon={Users}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-500/10"
                    loading={isLoading}
                />
                <StatsCard
                    title="Open Positions"
                    value={careersData?.active ?? 0}
                    description={`${careersData?.totalApplications ?? 0} applications`}
                    icon={Buildings}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-500/10"
                    loading={isLoading}
                />
                <StatsCard
                    title="New Inquiries"
                    value={contactsData?.new ?? 0}
                    description={`${contactsData?.total ?? 0} all-time`}
                    icon={Phone}
                    iconColor="text-rose-600"
                    iconBg="bg-rose-500/10"
                    loading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Articles" value={articlesData?.total ?? 0} icon={FileMagnifyingGlassIcon} iconColor="text-indigo-600" iconBg="bg-indigo-500/10" loading={isLoading} />
                <StatsCard title="Projects" value={projectsData?.total ?? 0} description={`${projectsData?.inProgress ?? 0} in progress`} icon={Kanban} iconColor="text-purple-600" iconBg="bg-purple-500/10" loading={isLoading} />
                <StatsCard title="Testimonials" value={testimonialsData?.approved ?? 0} description={`${testimonialsData?.pending ?? 0} pending`} icon={Star} iconColor="text-yellow-600" iconBg="bg-yellow-500/10" loading={isLoading} />
                <StatsCard title="Resources" value={resourcesData?.total ?? 0} icon={Folder} iconColor="text-cyan-600" iconBg="bg-cyan-500/10" loading={isLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>Content Performance</CardTitle>
                            <CardDescription>Last 12 months · blogs, articles, inquiries</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/analytics">View all <ArrowRight size={14} className="ml-1" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                <XAxis dataKey="month" className="text-xs" />
                                <YAxis className="text-xs" />
                                <ReTooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Area type="monotone" dataKey="blogs" stroke="#3b82f6" fill="url(#g1)" />
                                <Area type="monotone" dataKey="articles" stroke="#10b981" fill="url(#g2)" />
                                <Area type="monotone" dataKey="contacts" stroke="#f59e0b" fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Frequently used shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                        {quickActions.map((a) => (
                            <Link
                                key={a.to}
                                to={a.to}
                                className="flex flex-col gap-2 p-4 rounded-lg border hover:border-primary/40 hover:bg-muted/40 transition-all group"
                            >
                                <div className={`size-8 rounded-md grid place-items-center ${a.color}`}>
                                    <a.icon size={16} weight="duotone" />
                                </div>
                                <p className="text-sm font-medium">{a.label}</p>
                                <Plus size={12} className="text-muted-foreground group-hover:text-primary ml-auto -mt-7" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Status</CardTitle>
                        <CardDescription>Distribution across stages</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-60 rounded-md" />
                        ) : projectStatus.length ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={projectStatus}
                                        dataKey="count"
                                        nameKey="status"
                                        innerRadius={50}
                                        outerRadius={85}
                                        paddingAngle={2}
                                    >
                                        {projectStatus.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ReTooltip />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-12">No projects yet</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>By Category</CardTitle>
                        <CardDescription>Top blog categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-60 rounded-md" />
                        ) : categoryData.length ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={categoryData} layout="vertical" margin={{ left: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                                    <XAxis type="number" className="text-xs" />
                                    <YAxis dataKey="category" type="category" className="text-xs" width={70} />
                                    <ReTooltip />
                                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-12">No data yet</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>New Inquiries</CardTitle>
                            <CardDescription>Latest contact form messages</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/contacts">All <ArrowRight size={13} className="ml-1" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="px-0">
                        <ScrollArea className="h-60 px-4">
                            {isLoading ? (
                                <div className="space-y-3 py-2">
                                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-md" />)}
                                </div>
                            ) : !recentContacts.length ? (
                                <p className="text-sm text-muted-foreground text-center py-12">No new inquiries</p>
                            ) : (
                                <div className="divide-y">
                                    {recentContacts.map((c) => (
                                        <Link to={`/contacts/${c._id}`} key={c._id} className="flex items-start gap-3 py-3 hover:bg-muted/40 -mx-2 px-2 rounded-md">
                                            <Avatar className="size-9">
                                                <AvatarFallback className="text-xs">{getInitials(c.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{c.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{c.subject}</p>
                                                <p className="text-[11px] text-muted-foreground">{formatRelative(c.createdAt)}</p>
                                            </div>
                                            <Badge variant="warning" className="text-[10px]">New</Badge>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Blogs</CardTitle>
                            <CardDescription>Latest published & drafts</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/blogs">View all <ArrowRight size={13} className="ml-1" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-md" />)}
                            </div>
                        ) : !recentBlogs.length ? (
                            <p className="text-sm text-muted-foreground text-center py-12">No blogs yet</p>
                        ) : (
                            <div className="divide-y">
                                {recentBlogs.map((b) => (
                                    <Link to={`/blogs/${b._id}`} key={b._id} className="flex items-center gap-3 py-3">
                                        <div className="size-12 rounded-md overflow-hidden bg-muted shrink-0">
                                            {b.coverImage?.url && <img src={b.coverImage.url} alt="" className="size-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{b.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                <span className="capitalize">{humanize(b.category || "")}</span>
                                                <span>·</span>
                                                <span className="flex items-center gap-1"><Eye size={11} /> {b.views ?? 0}</span>
                                                <span>·</span>
                                                <span className="flex items-center gap-1"><Calendar size={11} /> {formatRelative(b.createdAt)}</span>
                                            </div>
                                        </div>
                                        <Badge variant={b.status === "published" ? "success" : "secondary"} className="capitalize">{b.status}</Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Audit Activity</CardTitle>
                            <CardDescription>Recent admin actions</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/audit-logs">View all <ArrowRight size={13} className="ml-1" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-md" />)}
                            </div>
                        ) : !auditLogs.length ? (
                            <p className="text-sm text-muted-foreground text-center py-12">No activity yet</p>
                        ) : (
                            <div className="space-y-3">
                                {auditLogs.map((log) => (
                                    <div key={log._id} className="flex items-start gap-3 text-sm">
                                        <Avatar className="size-8 mt-0.5">
                                            <AvatarFallback className="text-[10px]">{getInitials(log.performedBy?.adminName || "?")}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm leading-snug">
                                                <span className="font-medium">{log.performedBy?.adminName || "System"}</span>{" "}
                                                <span className="text-muted-foreground">{log.description}</span>
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[10px] capitalize">{humanize(log.action)}</Badge>
                                                <span className="text-[11px] text-muted-foreground">{formatRelative(log.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
