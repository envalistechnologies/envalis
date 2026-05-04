import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PageHeader = ({ 
  badge, 
  title, 
  highlight, 
  description, 
  align = "center", 
  className, 
  size = "default" 
}) => {
  const alignClass = { 
    center: "text-center items-center", 
    left: "text-left items-start", 
    right: "text-right items-end" 
  };
  const titleSize = { 
    default: "text-3xl lg:text-4xl xl:text-5xl", 
    lg: "text-4xl lg:text-5xl xl:text-6xl", 
    sm: "text-2xl lg:text-3xl" 
  };

  return (
    <div className={cn("flex flex-col gap-4", alignClass[align], className)}>
      {badge && (
        <Badge variant="default" className="w-fit px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
          {badge}
        </Badge>
      )}
      <h2 className={cn("font-black leading-tight text-foreground", titleSize[size])}>
        {title}
        {highlight && (
          <span className="text-gradient block sm:inline"> {highlight}</span>
        )}
      </h2>
      {description && (
        <p className={cn(
          "text-muted-foreground leading-relaxed",
          align === "center" && "max-w-2xl",
          size === "default" ? "text-base lg:text-lg" : "text-sm lg:text-base"
        )}>
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;
