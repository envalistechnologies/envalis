import api from "./axiosInstance";

export const authAPI = {
    login: (data) => api.post("/auth/login", data),
    verify2FA: (data, tempToken) =>
        api.post("/auth/verify-2fa", data, {
            headers: { Authorization: `Bearer ${tempToken}` },
        }),
    logout: () => api.post("/auth/logout"),
    getMe: () => api.get("/auth/me"),
    changePassword: (data) => api.patch("/auth/change-password", data),
    forgotPassword: (data) => api.post("/auth/forgot-password", data),
    resetPassword: (token, data) =>
        api.patch(`/auth/reset-password/${token}`, data),
    setup2FA: () => api.get("/auth/setup-2fa"),
    enable2FA: (data) => api.post("/auth/enable-2fa", data),
    disable2FA: (data) => api.post("/auth/disable-2fa", data),
    updateProfile: (data) => api.patch("/auth/update-profile", data),
    updateAvatar: (formData) => api.patch("/auth/update-avatar", formData, { headers: { "Content-Type": "multipart/form-data" } }),
};