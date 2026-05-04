import { Outlet } from "react-router-dom";

const AuthLayout = () => (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4 shadow-xl shadow-primary/30">
                    <span className="text-primary-foreground font-black text-2xl">E</span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Enovalis</h1>
                <p className="text-slate-400 mt-1 text-sm">Admin Control Panel</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
                <Outlet />
            </div>
            <p className="text-center text-slate-600 text-xs mt-6">
                © {new Date().getFullYear()} Enovalis. Authorized personnel only.
            </p>
        </div>
    </div>
);

export default AuthLayout;