import { useNavigate } from "react-router-dom";
import { Ghost, ArrowLeft, WarningCircle, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const NotFound = ({ title = "Page not found", message = "The page you're looking for doesn't exist.", showBack = true }) => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-75 gap-4 p-8">
            <Ghost size={64} className="text-muted-foreground/40" weight="duotone" />
            <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
            </div>
            {showBack && (
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} className="mr-2" /> Go Back
                </Button>
            )}
        </div>
    );
};

export const ErrorState = ({ title = "Something went wrong", message, onRetry }) => (
    <div className="flex flex-col items-center justify-center min-h-75 gap-4 p-8">
        <WarningCircle size={48} className="text-destructive/60" weight="duotone" />
        <div className="text-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            {message && <p className="text-sm text-muted-foreground mt-1">{message}</p>}
        </div>
        {onRetry && (
            <Button variant="outline" onClick={onRetry}>
                <ArrowClockwise size={16} className="mr-2" /> Try Again
            </Button>
        )}
    </div>
);

export const EmptyState = ({ icon: Icon = Ghost, title = "No data found", message = "There's nothing here yet.", action, actionLabel = "Add New" }) => (
    <div className="flex flex-col items-center justify-center min-h-75 gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Icon size={32} className="text-muted-foreground" weight="duotone" />
        </div>
        <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        {action && (
            <Button onClick={action}>{actionLabel}</Button>
        )}
    </div>
);