import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  description,
  trend,
  className = "" 
}) => (
  <Card className={cn("hover:shadow-md transition-shadow", className)}>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ml-2 shrink-0">
            <Icon size={20} className="text-primary" weight="duotone" />
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-3 text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}% vs last period
        </div>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
