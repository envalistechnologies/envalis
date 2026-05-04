import api from "./axiosInstance";

export const blogsAPI = {
    getAll: (params) => api.get("/blogs", { params }),
    getById: (id) => api.get(`/blogs/${id}`),
    create: (formData) =>
        api.post("/blogs", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    update: (id, formData) =>
        api.put(`/blogs/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    delete: (id) => api.delete(`/blogs/${id}`),
    publish: (id) => api.patch(`/blogs/${id}/publish`),
    unpublish: (id) => api.patch(`/blogs/${id}/unpublish`),
    getStats: () => api.get("/blogs/stats"),
};