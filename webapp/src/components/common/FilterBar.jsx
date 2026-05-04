import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";

const FilterBar = ({ 
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onFilterChange,
  onReset,
  showReset = true
}) => {
  const hasActiveFilters = searchValue || filters.some(f => f.value);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-md">
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="rounded-lg"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <Select 
              key={filter.id}
              value={filter.value || "all"} 
              onValueChange={(v) => onFilterChange(filter.id, v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-40 rounded-lg text-sm">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label.toLowerCase()}</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {showReset && hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onReset}
              className="gap-1"
            >
              <X size={16} /> Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
