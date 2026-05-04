import { MagnifyingGlass, X, FunnelSimple } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SearchFilter = ({ search, onSearchChange, filters = [], onReset, placeholder = "Search...", extra }) => {
    const hasActiveFilters = filters.some((f) => f.value && f.value !== "all");

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 pr-9"
                />
                {search && (
                    <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>

            {filters.map((filter) => (
                <Select key={filter.key} value={filter.value || "all"} onValueChange={(v) => filter.onChange(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-full sm:w-40">
                        <FunnelSimple size={14} className="mr-1.5 text-muted-foreground" />
                        <SelectValue placeholder={filter.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All {filter.placeholder}</SelectItem>
                        {filter.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ))}

            {extra}

            {(hasActiveFilters || search) && (
                <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground shrink-0">
                    <X size={14} className="mr-1" /> Clear
                </Button>
            )}
        </div>
    );
};

export default SearchFilter;