import { CircleNotch } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const LoadingSpinner = ({ size = 24, className, text }) => (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <CircleNotch size={size} className="animate-spin text-primary" weight="bold" />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
);

export const PageLoader = () => (
    <div className="flex items-center justify-center h-full min-h-100">
        <LoadingSpinner size={32} text="Loading..." />
    </div>
);

export const TableLoader = ({ rows = 5, cols = 4 }) => (
    <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
                {Array.from({ length: cols }).map((_, j) => (
                    <Skeleton key={j} className="h-10 flex-1 rounded-md" />
                ))}
            </div>
        ))}
    </div>
);

export default LoadingSpinner;
