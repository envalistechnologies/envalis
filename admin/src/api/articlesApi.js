import api from "./axiosInstance";

export const articlesAPI = {
    getAll: (params) => api.get("/articles", { params }),
    getById: (id) => api.get(`/articles/${id}`),
    create: (formData) =>
        api.post("/articles", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    update: (id, formData) =>
        api.put(`/articles/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    delete: (id) => api.delete(`/articles/${id}`),
    publish: (id) => api.patch(`/articles/${id}/publish`),
    getStats: () => api.get("/articles/stats"),
};