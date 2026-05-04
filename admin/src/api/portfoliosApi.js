import api from "./axiosInstance";

export const portfoliosAPI = {
    getAll: (params) => api.get("/portfolios", { params }),
    getById: (id) => api.get(`/portfolios/${id}`),
    create: (formData) => api.post("/portfolios", formData, { headers: { "Content-Type": "multipart/form-data" } }),
    update: (id, formData) => api.put(`/portfolios/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
    delete: (id) => api.delete(`/portfolios/${id}`),
};