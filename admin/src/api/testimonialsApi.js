import api from "./axiosInstance";

export const testimonialsAPI = {
    getAll: (params) => api.get("/testimonials", { params }),
    getById: (id) => api.get(`/testimonials/${id}`),
    create: (formData) => api.post("/testimonials", formData, { headers: { "Content-Type": "multipart/form-data" } }),
    update: (id, formData) => api.put(`/testimonials/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
    delete: (id) => api.delete(`/testimonials/${id}`),
    approve: (id) => api.patch(`/testimonials/${id}/approve`),
    reject: (id) => api.patch(`/testimonials/${id}/reject`),
    toggleFeatured: (id) => api.patch(`/testimonials/${id}/toggle-featured`),
    getStats: () => api.get("/testimonials/stats"),
};