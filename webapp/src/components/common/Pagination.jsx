import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.pages <= 1) return null;
    const { page, pages } = pagination;

    const getPages = () => {
        const delta = 2, range = [];
        for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) range.push(i);
        if (page - delta > 2) range.unshift("...");
        if (page + delta < pages - 1) range.push("...");
        if (pages > 1) range.unshift(1);
        if (pages > 1) range.push(pages);
        return range;
    };

    return (
        <div className="flex items-center justify-center gap-2 py-8">
            <Button variant="outline" size="icon" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="rounded-xl">
                <CaretLeft size={16} />
            </Button>
            {getPages().map((p, i) =>
                p === "..." ? (
                    <span key={`e${i}`} className="text-muted-foreground px-1">…</span>
                ) : (
                    <Button
                        key={p}
                        variant={p === page ? "default" : "ghost"}
                        size="icon"
                        onClick={() => onPageChange(p)}
                        className={cn("rounded-xl w-10 h-10 text-sm", p === page && "shadow-md shadow-primary/20")}
                    >
                        {p}
                    </Button>
                )
            )}
            <Button variant="outline" size="icon" onClick={() => onPageChange(page + 1)} disabled={page >= pages} className="rounded-xl">
                <CaretRight size={16} />
            </Button>
        </div>
    );
};

export default Pagination;