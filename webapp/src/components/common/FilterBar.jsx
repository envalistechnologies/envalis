import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const FilterBar = ({ 
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onFilterChange,
  onReset,
  showReset = true,
  categories,
  activeCategory,
  onCategoryChange
}) => {
  const hasActiveFilters = searchValue || filters.some(f => f.value) || activeCategory;

  return (
    <div className="space-y-5">
      {/* Search + Selects row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-md relative">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-white text-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <select
              key={filter.id}
              value={filter.value || "all"}
              onChange={(e) => onFilterChange(filter.id, e.target.value === "all" ? "" : e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 cursor-pointer"
            >
              <option value="all">All {filter.label.toLowerCase()}</option>
              {filter.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ))}

          {showReset && hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onReset}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <X size={14} /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Category pills */}
      {categories && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => onCategoryChange("")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              !activeCategory
                ? "bg-foreground text-white shadow-sm"
                : "bg-slate-100 text-muted-foreground hover:bg-slate-200"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200",
                activeCategory === cat
                  ? "bg-foreground text-white shadow-sm"
                  : "bg-slate-100 text-muted-foreground hover:bg-slate-200"
              )}
            >
              {cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
