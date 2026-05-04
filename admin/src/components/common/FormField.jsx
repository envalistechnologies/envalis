import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FormField = ({ label, htmlFor, error, hint, required, children, className }) => (
    <div className={cn("space-y-1.5", className)}>
        {label && (
            <Label htmlFor={htmlFor} className="text-sm font-medium">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </Label>
        )}
        {children}
        {error ? (
            <p className="text-xs text-destructive">{error}</p>
        ) : hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
    </div>
);

export default FormField;
