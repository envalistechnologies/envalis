import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("envalis_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

// Guard prevents multiple simultaneous 401s from triggering multiple redirects
let isRedirecting = false;

api.interceptors.response.use(
    (res) => res,
    (error) => {
        // Log CORS errors
        if (error.message === "Network Error" && !error.response) {
            console.error("CORS or Network Error:", error);
        }
        
        if (error.response?.status === 401 && !isRedirecting) {
            isRedirecting = true;
            localStorage.removeItem("envalis_token");
            localStorage.removeItem("envalis-admin-store");
            window.location.href = "/auth/login";
        }
        return Promise.reject(error);
    }
);

export default api;