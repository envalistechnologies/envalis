import api from "./axiosInstance";

export const employeesAPI = {
    getAll: (params) => api.get("/employees", { params }),
    getById: (id) => api.get(`/employees/${id}`),
    create: (formData) => api.post("/employees", formData, { headers: { "Content-Type": "multipart/form-data" } }),
    update: (id, formData) => api.put(`/employees/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
    delete: (id) => api.delete(`/employees/${id}`),
    getStats: () => api.get("/employees/stats"),
    uploadDocument: (id, formData) => api.post(`/employees/${id}/documents`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
    deleteDocument: (id, docId) => api.delete(`/employees/${id}/documents/${docId}`),
};