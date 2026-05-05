import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const NavItem = ({ item, collapsed }) => {
    const Icon = item.icon;

    const content = (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                    collapsed && "w-full justify-center gap-0 px-0 hover:bg-sidebar-accent",
                    isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                )
            }
        >
            <Icon size={18} weight="duotone" />
            {!collapsed && <span>{item.label}</span>}
        </NavLink>
    );

    if (collapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
        );
    }

    return content;
};

export default NavItem;