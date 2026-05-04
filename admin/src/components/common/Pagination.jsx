import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Pagination = ({ pagination, onPageChange, onLimitChange, showLimitSelector = true }) => {
    if (!pagination) return null;
    const { page, pages, total, limit } = pagination;

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
            range.push(i);
        }
        if (page - delta > 2) range.unshift("...");
        if (page + delta < pages - 1) range.push("...");
        if (pages > 1) range.unshift(1);
        if (pages > 1) range.push(pages);
        return range;
    };

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{Math.min((page - 1) * limit + 1, total)}</span>–
                    <span className="font-medium text-foreground">{Math.min(page * limit, total)}</span> of{" "}
                    <span className="font-medium text-foreground">{total}</span> results
                </p>
                {showLimitSelector && (
                    <Select value={String(limit)} onValueChange={(v) => onLimitChange?.(Number(v))}>
                        <SelectTrigger className="h-8 w-17.5">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100].map((l) => (
                                <SelectItem key={l} value={String(l)}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
                    <CaretLeft size={14} />
                </Button>
                {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
                    ) : (
                        <Button
                            key={p}
                            variant={p === page ? "default" : "outline"}
                            size="icon"
                            className="h-8 w-8 text-sm"
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </Button>
                    )
                )}
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page + 1)} disabled={page >= pages}>
                    <CaretRight size={14} />
                </Button>
            </div>
        </div>
    );
};

export default Pagination;