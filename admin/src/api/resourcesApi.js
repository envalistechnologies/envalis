import api from "./axiosInstance";

export const resourcesAPI = {
    getAll: (params) => api.get("/resources", { params }),
    getById: (id) => api.get(`/resources/${id}`),
    create: (formData) => api.post("/resources", formData, { headers: { "Content-Type": "multipart/form-data" } }),
    update: (id, formData) => api.put(`/resources/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
    delete: (id) => api.delete(`/resources/${id}`),
};