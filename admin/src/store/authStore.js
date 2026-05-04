import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "@/api/authApi";
import api from "@/api/axiosInstance";

const useAuth = create(
    persist(
        (set, get) => ({
            admin: null,
            token: null,
            tempToken: null,
            requires2FA: false,
            loading: false,

            setLoading: (loading) => set({ loading }),

            login: async (credentials) => {
                const { data } = await authAPI.login(credentials);
                if (data.requires2FA) {
                    set({ requires2FA: true, tempToken: data.tempToken });
                    return { requires2FA: true };
                }
                localStorage.setItem("envalis_token", data.accessToken);
                api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
                set({ admin: data.admin, token: data.accessToken, requires2FA: false, tempToken: null });
                return { requires2FA: false };
            },

            verify2FA: async (token, backupCode) => {
                const { tempToken } = get();
                const { data } = await authAPI.verify2FA({ token, backupCode }, tempToken);
                localStorage.setItem("envalis_token", data.accessToken);
                api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
                set({ admin: data.admin, token: data.accessToken, requires2FA: false, tempToken: null });
            },

            logout: async () => {
                try { await authAPI.logout(); } catch { }
                localStorage.removeItem("envalis_token");
                delete api.defaults.headers.common.Authorization;
                set({ admin: null, token: null, requires2FA: false, tempToken: null });
            },

            refreshAdmin: async () => {
                try {
                    const { data } = await authAPI.getMe();
                    set({ admin: data.admin });
                } catch { }
            },

            updateAdmin: (updatedAdmin) => set({ admin: updatedAdmin }),

            hasPermission: (resource, action) => {
                const { admin } = get();
                if (!admin) return false;
                if (admin.role === "super_admin") return true;
                return admin.permissions?.[resource]?.[action] || false;
            },

            hasRole: (...roles) => {
                const { admin } = get();
                if (!admin) return false;
                return roles.includes(admin.role);
            },

            isSuperAdmin: () => get().admin?.role === "super_admin",
        }),
        {
            name: "envalis-admin-store",
            partialize: (state) => ({ admin: state.admin, token: state.token }),
        }
    )
);

export { useAuth };