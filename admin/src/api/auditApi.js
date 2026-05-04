import api from "./axiosInstance";

export const auditAPI = {
    getAll: (params) => api.get("/audit-logs", { params }),
    getById: (id) => api.get(`/audit-logs/${id}`),
    getStats: () => api.get("/audit-logs/stats"),
};