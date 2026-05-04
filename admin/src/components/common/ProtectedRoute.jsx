import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/store/authStore";
import { PageLoader } from "./LoadingSpinner";

const ProtectedRoute = ({ roles, permission }) => {
    const { admin, token, refreshAdmin, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (token && !admin) refreshAdmin();
    }, [token, admin, refreshAdmin]);

    if (!token) return <Navigate to="/auth/login" state={{ from: location }} replace />;
    if (token && !admin) return <PageLoader />;
    if (loading) return <PageLoader />;

    if (roles && !roles.includes(admin.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    if (permission) {
        const [resource, action] = permission;
        const allowed = admin.role === "super_admin" || admin.permissions?.[resource]?.[action];
        if (!allowed) return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
