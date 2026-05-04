import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CardGrid = ({ children, cols = 3, className = "" }) => (
  <div className={cn(
    "grid gap-6",
    cols === 1 && "grid-cols-1",
    cols === 2 && "md:grid-cols-2",
    cols === 3 && "md:grid-cols-2 lg:grid-cols-3",
    cols === 4 && "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    className
  )}>
    {children}
  </div>
);

export const ItemCard = ({ 
  image, 
  imageAlt,
  badge,
  title, 
  description, 
  meta,
  footer,
  onClick,
  className = "",
  imageClassName = ""
}) => (
  <Card className={cn("overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1", className)} onClick={onClick}>
    {image && (
      <div className={cn("relative overflow-hidden bg-muted aspect-[16/9] w-full", imageClassName)}>
        <img 
          src={image} 
          alt={imageAlt} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badge && (
          <div className="absolute top-3 right-3">
            {badge}
          </div>
        )}
      </div>
    )}
    <CardContent className="p-5">
      {title && (
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {description}
        </p>
      )}
      {meta && (
        <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
          {meta}
        </div>
      )}
      {footer && (
        <div className="mt-4 pt-4 border-t">
          {footer}
        </div>
      )}
    </CardContent>
  </Card>
);

export { CardGrid };
export default CardGrid;
