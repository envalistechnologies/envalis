import api from "./axiosInstance";

export const contactsAPI = {
    getAll: (params) => api.get("/contact", { params }),
    getById: (id) => api.get(`/contact/${id}`),
    updateStatus: (id, data) => api.patch(`/contact/${id}`, data),
    delete: (id) => api.delete(`/contact/${id}`),
    getStats: () => api.get("/contact/stats"),
};