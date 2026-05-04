import api from "./axiosInstance";

export const servicesAPI = {
    getAll: (params) => api.get("/services", { params }),
    getById: (id) => api.get(`/services/${id}`),
    create: (formData) => api.post("/services", formData, { headers: { "Content-Type": "multipart/form-data" } }),
    update: (id, formData) => api.put(`/services/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
    delete: (id) => api.delete(`/services/${id}`),
};