import api from "./axiosInstance";

export const adminsAPI = {
    getAll: (params) => api.get("/admins", { params }),
    getById: (id) => api.get(`/admins/${id}`),
    create: (data) => api.post("/admins", data),
    update: (id, data) => api.put(`/admins/${id}`, data),
    delete: (id) => api.delete(`/admins/${id}`),
    changeRole: (id, data) => api.patch(`/admins/${id}/role`, data),
    toggleStatus: (id) => api.patch(`/admins/${id}/toggle-status`),
    updateAvatar: (id, formData) =>
        api.patch(`/admins/${id}/avatar`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    getStats: () => api.get("/admins/stats"),
};