import api from "./axiosInstance";

export const emailsAPI = {
    sendDirect: (data) => api.post("/emails/send", data),
    sendBulk: (data) => api.post("/emails/send-bulk", data),
    sendTemplate: (data) => api.post("/emails/send-template", data),
    getLogs: (params) => api.get("/emails/logs", { params }),
    getLogById: (id) => api.get(`/emails/logs/${id}`),
    getStats: () => api.get("/emails/logs/stats"),
    getTemplates: (params) => api.get("/emails/templates", { params }),
    getTemplateById: (id) => api.get(`/emails/templates/${id}`),
    createTemplate: (data) => api.post("/emails/templates", data),
    updateTemplate: (id, data) => api.put(`/emails/templates/${id}`, data),
    deleteTemplate: (id) => api.delete(`/emails/templates/${id}`),
    previewTemplate: (id, data) => api.post(`/emails/templates/${id}/preview`, data),
};