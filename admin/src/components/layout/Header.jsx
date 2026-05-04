import { useNavigate, useLocation, Link } from "react-router-dom";
import { Bell, MagnifyingGlass, Sun, Moon, SignOut, UserCircle, Gear, Key, ShieldCheck } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { useAuth } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getInitials, humanize } from "@/lib/utils";

const titleMap = {
    "/dashboard": "Dashboard",
    "/analytics": "Analytics",
    "/blogs": "Blogs",
    "/articles": "Articles",
    "/portfolios": "Portfolios",
    "/case-studies": "Case Studies",
    "/testimonials": "Testimonials",
    "/services": "Services",
    "/resources": "Resources",
    "/projects": "Projects",
    "/employees": "Employees",
    "/careers": "Careers",
    "/contacts": "Contacts",
    "/admins": "Admins",
    "/audit-logs": "Audit Logs",
    "/profile": "My Profile",
    "/settings": "Settings",
    "/emails/send": "Send Email",
    "/emails/templates": "Email Templates",
    "/emails/logs": "Email Logs",
};

const Header = () => {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { theme, setTheme } = useTheme();

    const segment = "/" + pathname.split("/").filter(Boolean)[0];
    const title = titleMap[pathname] || titleMap[segment] || "Admin";

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/auth/login");
    };

    return (
        <TooltipProvider delayDuration={100}>
            <header className="h-15.5 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <h1 className="text-base font-semibold tracking-tight truncate">{title}</h1>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative hidden md:block">
                        <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input placeholder="Quick search..." className="pl-9 w-72 h-9 bg-muted/40 border-transparent focus-visible:bg-background" />
                        <kbd className="hidden lg:inline-flex pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 select-none items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            ⌘K
                        </kbd>
                    </div>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                                {theme === "dark" ? <Sun size={17} weight="duotone" /> : <Moon size={17} weight="duotone" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle theme</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell size={17} weight="duotone" />
                                <span className="absolute top-2 right-2 size-1.5 rounded-full bg-red-500 ring-2 ring-background" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Notifications</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 px-1.5 h-9 rounded-md hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <Avatar className="size-7">
                                    <AvatarImage src={admin?.avatar?.url} alt={admin?.firstName} />
                                    <AvatarFallback className="text-[11px] bg-primary text-primary-foreground">
                                        {getInitials(`${admin?.firstName ?? ""} ${admin?.lastName ?? ""}`)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium hidden sm:block">{admin?.firstName}</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-60">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-semibold">{admin?.firstName} {admin?.lastName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{admin?.email}</p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Role: <span className="font-medium text-foreground">{humanize(admin?.role || "")}</span>
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/profile"><UserCircle size={16} className="mr-2" weight="duotone" /> My Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/settings"><Gear size={16} className="mr-2" weight="duotone" /> Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/settings/security"><Key size={16} className="mr-2" weight="duotone" /> Change Password</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/settings/2fa"><ShieldCheck size={16} className="mr-2" weight="duotone" /> Two-Factor Auth</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                <SignOut size={16} className="mr-2" weight="duotone" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
        </TooltipProvider>
    );
};

export default Header;
