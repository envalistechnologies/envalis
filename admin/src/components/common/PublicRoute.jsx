import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/authStore";

const PublicRoute = () => {
    const { token, admin } = useAuth();
    if (token && admin) return <Navigate to="/dashboard" replace />;
    return <Outlet />;
};

export default PublicRoute;
