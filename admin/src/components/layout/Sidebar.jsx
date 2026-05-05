import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    CaretDoubleLeft,
    CaretDoubleRight,
    SignOut,
} from "@phosphor-icons/react";
import NavItem from "./NavItem";
import Logo from "@/assets/envalis.svg";

const Sidebar = ({ admin, navGroups = [], hasPermission, hasRole, handleLogout }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <TooltipProvider delayDuration={150}>
            <aside
                className={cn(
                    "bg-sidebar border-r border-sidebar-border h-screen flex flex-col min-h-0",
                    collapsed ? "w-16" : "w-64"
                )}
            >
                <div className={cn("flex items-start gap-3 border-b border-sidebar-border py-3", collapsed ? "justify-center px-2" : "px-4") }>
                    {/* Logo */}
                    <div className="size-9 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold text-lg shadow-md shrink-0 mt-0.5">
                        <img src={Logo} alt="Logo" />
                    </div>

                    {/* Text */}
                    {!collapsed && (
                        <div className="flex flex-col leading-tight">
                            <p className="text-sm font-semibold">Envalis</p>
                            <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
                        </div>
                    )}
                </div>

                <ScrollArea className="flex-1 min-h-0">
                    <nav className={cn("py-4 space-y-5", collapsed ? "px-2" : "px-3")}>
                        {navGroups.map((group) => {
                            const visibleItems = group.items.filter((it) =>
                                it.roles
                                    ? hasRole(...it.roles)
                                    : it.perm
                                        ? hasPermission(it.perm[0], it.perm[1])
                                        : true
                            );
                            if (!visibleItems.length) return null;

                            return (
                                <div key={group.label}>
                                    {!collapsed && (
                                        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                                            {group.label}
                                        </p>
                                    )}
                                    <div className="space-y-0.5">
                                        {visibleItems.map((item) => (
                                            <NavItem
                                                key={item.path}
                                                item={item}
                                                collapsed={collapsed}
                                                hasPermission={hasPermission}
                                                hasRole={hasRole}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </nav>
                </ScrollArea>

                <Separator />

                <div className={cn("p-3 space-y-2", collapsed && "px-2") }>
                    {!collapsed && admin && (
                        <div className="px-3 py-2 rounded-md bg-sidebar-accent/50 text-xs">
                            <p className="font-medium truncate text-sidebar-foreground">
                                {admin.firstName} {admin.lastName}
                            </p>
                            <p className="text-sidebar-foreground/60 truncate capitalize">
                                {admin.role?.replace("_", " ")}
                            </p>
                        </div>
                    )}

                    <div className={collapsed ? "flex flex-col items-stretch gap-2" : "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"}>
                        {collapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="w-full justify-start px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <SignOut size={16} className="shrink-0" weight="bold" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Logout</TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="flex-1 justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <SignOut size={16} className="mr-2" weight="bold" />
                                Logout
                            </Button>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size={collapsed ? "sm" : "icon"}
                                    onClick={() => setCollapsed((prev) => !prev)}
                                    className={cn(
                                        collapsed
                                            ? "w-full justify-start px-3 text-sidebar-foreground hover:bg-sidebar-accent"
                                            : "shrink-0"
                                    )}
                                >
                                    {collapsed ? <CaretDoubleRight size={14} className="shrink-0" /> : <CaretDoubleLeft size={14} className="shrink-0" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                {collapsed ? "Expand" : "Collapse"}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </aside>
        </TooltipProvider>
    );
};

export default Sidebar;