import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const StatsCard = ({ title, value, icon: Icon, iconColor = "text-primary", iconBg = "bg-primary/10", change, loading, suffix, description }) => {
    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-8 w-16 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                </CardContent>
            </Card>
        );
    }

    const changeColor = change > 0 ? "text-green-600" : change < 0 ? "text-red-500" : "text-muted-foreground";
    const ChangeIcon = change > 0 ? TrendUp : change < 0 ? TrendDown : Minus;

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-bold tracking-tight text-foreground">{value ?? "—"}</p>
                            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
                        </div>
                        {description && <p className="text-xs text-muted-foreground">{description}</p>}
                        {change !== undefined && (
                            <div className={cn("flex items-center gap-1 text-xs font-medium", changeColor)}>
                                <ChangeIcon size={13} weight="bold" />
                                <span>{Math.abs(change)}% vs last month</span>
                            </div>
                        )}
                    </div>
                    {Icon && (
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
                            <Icon size={22} weight="duotone" className={iconColor} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default StatsCard;