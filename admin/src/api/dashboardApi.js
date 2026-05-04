import api from "./axiosInstance";

export const dashboardAPI = {
    get: () => api.get("/dashboard"),
};
