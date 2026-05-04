import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const PageHeader = ({ title, description, actions, showBack = false, backPath }) => {
    const navigate = useNavigate();
    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    {showBack && (
                        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" onClick={() => (backPath ? navigate(backPath) : navigate(-1))}>
                            <ArrowLeft size={18} />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
            </div>
            <Separator />
        </div>
    );
};

export default PageHeader;