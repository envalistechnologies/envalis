import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { queryClient } from "@/lib/queryClient";
import Layout from "@/components/layout/Layout";
import AuthLayout from "@/components/common/AuthLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import PublicRoute from "@/components/common/PublicRoute";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { NotFound } from "@/components/common/EmptyStates";

// Auth
const Login = lazy(() => import("@/pages/auth/Login"));
const Verify2FA = lazy(() => import("@/pages/auth/Verify2FA"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));

// Dashboard
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const Analytics = lazy(() => import("@/pages/dashboard/Analytics"));

// Admins
const AdminsList = lazy(() => import("@/pages/admins/AdminsList"));
const AdminForm = lazy(() => import("@/pages/admins/AdminForm"));
const AdminDetail = lazy(() => import("@/pages/admins/AdminDetail"));

// Profile / Settings
const Profile = lazy(() => import("@/pages/profile/Profile"));
const Settings = lazy(() => import("@/pages/profile/Settings"));
const SecuritySettings = lazy(() => import("@/pages/profile/SecuritySettings"));
const TwoFactorSettings = lazy(() => import("@/pages/profile/TwoFactorSettings"));

// Employees
const EmployeesList = lazy(() => import("@/pages/employees/EmployeesList"));
const EmployeeForm = lazy(() => import("@/pages/employees/EmployeeForm"));
const EmployeeDetail = lazy(() => import("@/pages/employees/EmployeeDetail"));

// Blogs
const BlogsList = lazy(() => import("@/pages/blogs/BlogsList"));
const BlogForm = lazy(() => import("@/pages/blogs/BlogForm"));
const BlogDetail = lazy(() => import("@/pages/blogs/BlogDetail"));

// Articles
const ArticlesList = lazy(() => import("@/pages/articles/ArticlesList"));
const ArticleForm = lazy(() => import("@/pages/articles/ArticleForm"));
const ArticleDetail = lazy(() => import("@/pages/articles/ArticleDetail"));

// Portfolios
const PortfoliosList = lazy(() => import("@/pages/portfolios/PortfoliosList"));
const PortfolioForm = lazy(() => import("@/pages/portfolios/PortfolioForm"));
const PortfolioDetail = lazy(() => import("@/pages/portfolios/PortfolioDetail"));

// Case Studies
const CaseStudiesList = lazy(() => import("@/pages/caseStudies/CaseStudiesList"));
const CaseStudyForm = lazy(() => import("@/pages/caseStudies/CaseStudyForm"));
const CaseStudyDetail = lazy(() => import("@/pages/caseStudies/CaseStudyDetail"));

// Testimonials
const TestimonialsList = lazy(() => import("@/pages/testimonials/TestimonialsList"));
const TestimonialForm = lazy(() => import("@/pages/testimonials/TestimonialForm"));
const TestimonialDetail = lazy(() => import("@/pages/testimonials/TestimonialDetail"));

// Services
const ServicesList = lazy(() => import("@/pages/services/ServicesList"));
const ServiceForm = lazy(() => import("@/pages/services/ServiceForm"));
const ServiceDetail = lazy(() => import("@/pages/services/ServiceDetail"));

// Resources
const ResourcesList = lazy(() => import("@/pages/resources/ResourcesList"));
const ResourceForm = lazy(() => import("@/pages/resources/ResourceForm"));
const ResourceDetail = lazy(() => import("@/pages/resources/ResourceDetail"));

// Projects
const ProjectsList = lazy(() => import("@/pages/projects/ProjectsList"));
const ProjectForm = lazy(() => import("@/pages/projects/ProjectForm"));
const ProjectDetail = lazy(() => import("@/pages/projects/ProjectDetail"));

// Careers
const CareersList = lazy(() => import("@/pages/careers/CareersList"));
const CareerForm = lazy(() => import("@/pages/careers/CareerForm"));
const CareerDetail = lazy(() => import("@/pages/careers/CareerDetail"));
const CareerApplications = lazy(() => import("@/pages/careers/CareerApplications"));

// Contacts
const ContactsList = lazy(() => import("@/pages/contacts/ContactsList"));
const ContactDetail = lazy(() => import("@/pages/contacts/ContactDetail"));

// Emails
const EmailSend = lazy(() => import("@/pages/emails/EmailSend"));
const EmailTemplatesList = lazy(() => import("@/pages/emails/EmailTemplatesList"));
const EmailTemplateForm = lazy(() => import("@/pages/emails/EmailTemplateForm"));
const EmailLogsList = lazy(() => import("@/pages/emails/EmailLogsList"));
const EmailLogDetail = lazy(() => import("@/pages/emails/EmailLogDetail"));

// Audit
const AuditLogsList = lazy(() => import("@/pages/audit/AuditLogsList"));
const AuditLogDetail = lazy(() => import("@/pages/audit/AuditLogDetail"));

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route element={<PublicRoute />}>
                            <Route element={<AuthLayout />}>
                                <Route path="/auth/login" element={<Login />} />
                                <Route path="/auth/verify-2fa" element={<Verify2FA />} />
                                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                                <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
                            </Route>
                        </Route>

                        <Route element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route index element={<Navigate to="/dashboard" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/analytics" element={<Analytics />} />

                                <Route path="/profile" element={<Profile />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/settings/security" element={<SecuritySettings />} />
                                <Route path="/settings/2fa" element={<TwoFactorSettings />} />

                                <Route element={<ProtectedRoute roles={["super_admin"]} />}>
                                    <Route path="/admins" element={<AdminsList />} />
                                    <Route path="/admins/new" element={<AdminForm />} />
                                    <Route path="/admins/:id" element={<AdminDetail />} />
                                    <Route path="/admins/:id/edit" element={<AdminForm />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["employees", "read"]} />}>
                                    <Route path="/employees" element={<EmployeesList />} />
                                    <Route path="/employees/new" element={<EmployeeForm />} />
                                    <Route path="/employees/:id" element={<EmployeeDetail />} />
                                    <Route path="/employees/:id/edit" element={<EmployeeForm />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["blogs", "read"]} />}>
                                    <Route path="/blogs" element={<BlogsList />} />
                                    <Route path="/blogs/new" element={<BlogForm />} />
                                    <Route path="/blogs/:id" element={<BlogDetail />} />
                                    <Route path="/blogs/:id/edit" element={<BlogForm />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["articles", "read"]} />}>
                                    <Route path="/articles" element={<ArticlesList />} />
                                    <Route path="/articles/new" element={<ArticleForm />} />
                                    <Route path="/articles/:id" element={<ArticleDetail />} />
                                    <Route path="/articles/:id/edit" element={<ArticleForm />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["portfolios", "read"]} />}>
                                    <Route path="/portfolios" element={<PortfoliosList />} />
                                    <Route path="/portfolios/new" element={<PortfolioForm />} />
                                    <Route path="/portfolios/:id" element={<PortfolioDetail />} />
                                    <Route path="/portfolios/:id/edit" element={<PortfolioForm />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["caseStudies", "read"]} />}>
                                    <Route path="/case-studies" element={<CaseStudiesList />} />
                                    <Route path="/case-studies/new" element={<CaseStudyForm />} />
                                    <Route path="/case-studies/:id" element={<CaseStudyDetail />} />
                                    <Route path="/case-studies/:id/edit" element={<CaseStudyForm />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["testimonials", "read"]} />}>
                                    <Route path="/testimonials" element={<TestimonialsList />} />
                                    <Route path="/testimonials/new" element={<TestimonialForm />} />
                                    <Route path="/testimonials/:id" element={<TestimonialDetail />} />
                                    <Route path="/testimonials/:id/edit" element={<TestimonialForm />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["services", "read"]} />}>
                                    <Route path="/services" element={<ServicesList />} />
                                    <Route path="/services/new" element={<ServiceForm />} />
                                    <Route path="/services/:id" element={<ServiceDetail />} />
                                    <Route path="/services/:id/edit" element={<ServiceForm />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["resources", "read"]} />}>
                                    <Route path="/resources" element={<ResourcesList />} />
                                    <Route path="/resources/new" element={<ResourceForm />} />
                                    <Route path="/resources/:id" element={<ResourceDetail />} />
                                    <Route path="/resources/:id/edit" element={<ResourceForm />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["projects", "read"]} />}>
                                    <Route path="/projects" element={<ProjectsList />} />
                                    <Route path="/projects/new" element={<ProjectForm />} />
                                    <Route path="/projects/:id" element={<ProjectDetail />} />
                                    <Route path="/projects/:id/edit" element={<ProjectForm />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["careers", "read"]} />}>
                                    <Route path="/careers" element={<CareersList />} />
                                    <Route path="/careers/new" element={<CareerForm />} />
                                    <Route path="/careers/:id" element={<CareerDetail />} />
                                    <Route path="/careers/:id/edit" element={<CareerForm />} />
                                    <Route path="/careers/:id/applications" element={<CareerApplications />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["contacts", "read"]} />}>
                                    <Route path="/contacts" element={<ContactsList />} />
                                    <Route path="/contacts/:id" element={<ContactDetail />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["emails", "send"]} />}>
                                    <Route path="/emails/send" element={<EmailSend />} />
                                    <Route path="/emails/templates" element={<EmailTemplatesList />} />
                                    <Route path="/emails/templates/new" element={<EmailTemplateForm />} />
                                    <Route path="/emails/templates/:id/edit" element={<EmailTemplateForm />} />
                                    <Route path="/emails/logs" element={<EmailLogsList />} />
                                    <Route path="/emails/logs/:id" element={<EmailLogDetail />} />
                                </Route>

                                <Route element={<ProtectedRoute permission={["auditLogs", "read"]} />}>
                                    <Route path="/audit-logs" element={<AuditLogsList />} />
                                    <Route path="/audit-logs/:id" element={<AuditLogDetail />} />
                                </Route>

                                <Route path="*" element={<NotFound />} />
                            </Route>
                        </Route>

                        <Route path="*" element={<Navigate to="/auth/login" replace />} />
                    </Routes>
                </Suspense>
                <Toaster richColors position="top-right" closeButton />
            </BrowserRouter>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
