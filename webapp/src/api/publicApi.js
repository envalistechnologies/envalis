import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
});

export const publicAPI = {
    // Blogs
    getBlogs: (p) => api.get("/blogs/public", { params: p }),
    getBlog: (slug) => api.get(`/blogs/public/${slug}`),
    // Articles
    getArticles: (p) => api.get("/articles/public", { params: p }),
    getArticle: (slug) => api.get(`/articles/public/${slug}`),
    // Portfolios
    getPortfolios: (p) => api.get("/portfolios/public", { params: p }),
    getPortfolio: (slug) => api.get(`/portfolios/public/${slug}`),
    // Case Studies
    getCaseStudies: (p) => api.get("/case-studies/public", { params: p }),
    getCaseStudy: (slug) => api.get(`/case-studies/public/${slug}`),
    // Testimonials
    getTestimonials: (p) => api.get("/testimonials/public", { params: p }),
    getFeaturedTestimonials: () => api.get("/testimonials/public/featured"),
    // Services
    getServices: (p) => api.get("/services/public", { params: p }),
    getService: (slug) => api.get(`/services/public/${slug}`),
    // Resources
    getResources: (p) => api.get("/resources/public", { params: p }),
    getResource: (slug) => api.get(`/resources/public/${slug}`),
    // Careers
    getJobs: (p) => api.get("/careers/public", { params: p }),
    getJob: (slug) => api.get(`/careers/public/${slug}`),
    applyJob: (id, fd) => api.post(`/careers/${id}/apply`, fd, { headers: { "Content-Type": "multipart/form-data" } }),
    // Employees
    getEmployees: () => api.get("/employees/public"),
    // Contact
    submitContact: (d) => api.post("/contact", d),
};

export default api;