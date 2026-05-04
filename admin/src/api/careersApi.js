import api from "./axiosInstance";

export const careersAPI = {
    getAll: (params) => api.get("/careers", { params }),
    getById: (id) => api.get(`/careers/${id}`),
    create: (data) => api.post("/careers", data),
    update: (id, data) => api.put(`/careers/${id}`, data),
    delete: (id) => api.delete(`/careers/${id}`),
    getApplications: (id, params) => api.get(`/careers/${id}/applications`, { params }),
    updateApplicationStatus: (id, appId, data) => api.patch(`/careers/${id}/applications/${appId}/status`, data),
    getStats: () => api.get("/careers/stats"),
};