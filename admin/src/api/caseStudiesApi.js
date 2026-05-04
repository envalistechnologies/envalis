import api from "./axiosInstance";

export const caseStudiesAPI = {
    getAll: (params) => api.get("/case-studies", { params }),
    getById: (id) => api.get(`/case-studies/${id}`),
    create: (formData) => api.post("/case-studies", formData, { headers: { "Content-Type": "multipart/form-data" } }),
    update: (id, formData) => api.put(`/case-studies/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
    delete: (id) => api.delete(`/case-studies/${id}`),
    publish: (id) => api.patch(`/case-studies/${id}/publish`),
};