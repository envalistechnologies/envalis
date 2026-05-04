import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend,
    RadialBarChart, RadialBar,
} from "recharts";
import { TrendUp, Eye, Users, Article, Star, Briefcase, Buildings, Phone, FileMagnifyingGlassIcon } from "@phosphor-icons/react";

import { blogsAPI } from "@/api/blogsApi";
import { articlesAPI } from "@/api/articlesApi";
import { careersAPI } from "@/api/careersApi";
import { employeesAPI } from "@/api/employeesApi";
import { contactsAPI } from "@/api/contactsApi";
import { testimonialsAPI } from "@/api/testimonialsApi";
import { projectsAPI } from "@/api/projectsApi";

import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatesCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#22c55e"];

const Analytics = () => {
    const [range, setRange] = useState("30d");

    const blogs = useQuery({ queryKey: ["analytics", "blogs"], queryFn: () => blogsAPI.getStats().then((r) => r.data) });
    const articles = useQuery({ queryKey: ["analytics", "articles"], queryFn: () => articlesAPI.getStats().then((r) => r.data) });
    const careers = useQuery({ queryKey: ["analytics", "careers"], queryFn: () => careersAPI.getStats().then((r) => r.data) });
    const employees = useQuery({ queryKey: ["analytics", "employees"], queryFn: () => employeesAPI.getStats().then((r) => r.data) });
    const contacts = useQuery({ queryKey: ["analytics", "contacts"], queryFn: () => contactsAPI.getStats().then((r) => r.data) });
    const testimonials = useQuery({ queryKey: ["analytics", "testimonials"], queryFn: () => testimonialsAPI.getStats().then((r) => r.data) });
    const projects = useQuery({ queryKey: ["analytics", "projects"], queryFn: () => projectsAPI.getStats().then((r) => r.data) });

    const monthly = blogs.data?.monthlyTrend || [];
    const categoryData = blogs.data?.byCategory || [];
    const departmentData = employees.data?.byDepartment || [];
    const sourceData = contacts.data?.bySource || [];
    const projectStatus = projects.data?.byStatus || [];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Analytics"
                description="In-depth performance metrics across all content and operations"
                actions={
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                            <SelectItem value="all">All time</SelectItem>
                        </SelectContent>
                    </Select>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Views" value={blogs.data?.totalViews ?? 0} icon={Eye} iconColor="text-blue-600" iconBg="bg-blue-500/10" loading={blogs.isLoading} />
                <StatsCard title="Total Content" value={(blogs.data?.total ?? 0) + (articles.data?.total ?? 0)} icon={Article} iconColor="text-purple-600" iconBg="bg-purple-500/10" loading={blogs.isLoading} />
                <StatsCard title="Engagement" value={blogs.data?.totalLikes ?? 0} suffix="likes" icon={Star} iconColor="text-amber-600" iconBg="bg-amber-500/10" loading={blogs.isLoading} />
                <StatsCard title="Conversions" value={contacts.data?.replied ?? 0} description={`${contacts.data?.total ?? 0} inquiries`} icon={TrendUp} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" loading={contacts.isLoading} />
            </div>

            <Tabs defaultValue="content">
                <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="people">People</TabsTrigger>
                    <TabsTrigger value="business">Business</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Trends</CardTitle>
                            <CardDescription>Blogs vs Articles published over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={monthly}>
                                    <defs>
                                        <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                    <XAxis dataKey="month" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <ReTooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="blogs" stroke="#3b82f6" fill="url(#ag1)" />
                                    <Area type="monotone" dataKey="articles" stroke="#10b981" fill="url(#ag2)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>By Category</CardTitle>
                                <CardDescription>Distribution of blog topics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {categoryData.length ? (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie data={categoryData} dataKey="count" nameKey="category" outerRadius={100} label>
                                                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <ReTooltip />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Skeleton className="h-70" />
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performing Posts</CardTitle>
                                <CardDescription>Ranked by total views</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={blogs.data?.topPosts || []} layout="vertical" margin={{ left: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                                        <XAxis type="number" className="text-xs" />
                                        <YAxis dataKey="title" type="category" className="text-xs" width={100} tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + "…" : v} />
                                        <ReTooltip />
                                        <Bar dataKey="views" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="people" className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard title="Total Employees" value={employees.data?.total ?? 0} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-500/10" />
                        <StatsCard title="Active" value={employees.data?.active ?? 0} icon={Users} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" />
                        <StatsCard title="On Leave" value={employees.data?.onLeave ?? 0} icon={Users} iconColor="text-amber-600" iconBg="bg-amber-500/10" />
                        <StatsCard title="New Hires" value={employees.data?.newHires ?? 0} description="Last 30 days" icon={TrendUp} iconColor="text-purple-600" iconBg="bg-purple-500/10" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>By Department</CardTitle>
                                <CardDescription>Headcount distribution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={departmentData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                        <XAxis dataKey="department" className="text-xs" tickFormatter={(v) => v?.replace(/_/g, " ")} />
                                        <YAxis className="text-xs" />
                                        <ReTooltip />
                                        <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Career Pipeline</CardTitle>
                                <CardDescription>Active openings & applications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadialBarChart innerRadius="20%" outerRadius="100%" data={careers.data?.byStatus || []} startAngle={90} endAngle={-270}>
                                        <RadialBar dataKey="count" fill="#3b82f6" background />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <ReTooltip />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="business" className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard title="Active Projects" value={projects.data?.inProgress ?? 0} icon={Briefcase} iconColor="text-blue-600" iconBg="bg-blue-500/10" />
                        <StatsCard title="Open Jobs" value={careers.data?.active ?? 0} icon={Buildings} iconColor="text-amber-600" iconBg="bg-amber-500/10" />
                        <StatsCard title="New Inquiries" value={contacts.data?.new ?? 0} icon={Phone} iconColor="text-rose-600" iconBg="bg-rose-500/10" />
                        <StatsCard title="Approved Reviews" value={testimonials.data?.approved ?? 0} icon={Star} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Pipeline</CardTitle>
                                <CardDescription>Status across all active work</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={projectStatus} dataKey="count" nameKey="status" innerRadius={60} outerRadius={110} paddingAngle={3}>
                                            {projectStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <ReTooltip />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Inquiry Source</CardTitle>
                                <CardDescription>Where leads are coming from</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={sourceData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                        <XAxis dataKey="source" className="text-xs" />
                                        <YAxis className="text-xs" />
                                        <ReTooltip />
                                        <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Analytics;
