import { CircleNotch, Ghost, WarningCircle, ArrowClockwise, MagnifyingGlass, SmileySad } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const LoadingSpinner = ({ size = 32, className }) => (
    <div className={cn("flex items-center justify-center", className)}>
        <CircleNotch size={size} weight="bold" className="animate-spin text-primary" />
    </div>
);

export const PageLoader = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-brand-600 to-purple-600 flex items-center justify-center animate-pulse">
                <span className="text-white font-black text-xl">E</span>
            </div>
            <CircleNotch size={48} weight="bold" className="animate-spin text-brand-500 absolute -inset-2" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">Loading...</p>
    </div>
);

export const EmptyState = ({ icon: Icon = Ghost, title = "Nothing here yet", description = "Check back soon for updates.", action, actionLabel, actionHref }) => (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5 mx-auto">
            <Icon size={36} weight="duotone" className="text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-sm">{description}</p>
        {action && (
            <Button onClick={action} className="mt-6">{actionLabel || "Try Again"}</Button>
        )}
    </div>
);

export const ErrorState = ({ title, message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-5">
            <WarningCircle size={36} weight="duotone" className="text-red-400" />
        </div>
        <h3 className="text-xl font-bold">{title || "Something went wrong"}</h3>
        <p className="text-muted-foreground mt-2">{message || "Unable to load content. Please try again."}</p>
        {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-6">
                <ArrowClockwise size={16} className="mr-2" /> Try Again
            </Button>
        )}
    </div>
);

export const NotFoundState = ({ title, message }) => (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
            <SmileySad size={36} weight="duotone" className="text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-bold">{title || "Not found"}</h3>
        <p className="text-muted-foreground mt-2">{message || "The item you're looking for doesn't exist or has been removed."}</p>
    </div>
);

export const NoResults = ({ query, title, message }) => (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
            <MagnifyingGlass size={36} weight="duotone" className="text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-bold">{title || "No results found"}</h3>
        <p className="text-muted-foreground mt-2">
            {message || (query ? `No results for "${query}". Try a different search term.` : "Try adjusting your filters.")}
        </p>
    </div>
);

export const SkeletonCard = ({ className }) => (
    <div className={cn("rounded-2xl border bg-card overflow-hidden animate-pulse", className)}>
        <div className="h-48 bg-muted" />
        <div className="p-5 space-y-3">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
        </div>
    </div>
);

export const LoadingSkeleton = ({ count = 6, className }) => (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);
