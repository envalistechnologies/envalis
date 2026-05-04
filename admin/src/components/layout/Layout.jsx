import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/store/authStore";
import { navGroups } from "./navConfig.js";

const Layout = () => {
    const { admin, logout, hasPermission, hasRole } = useAuth();

    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/auth/login");
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar
                admin={admin}
                navGroups={navGroups}
                hasPermission={hasPermission}
                hasRole={hasRole}
                handleLogout={handleLogout}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-screen-2xl mx-auto p-6 lg:p-8 space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;