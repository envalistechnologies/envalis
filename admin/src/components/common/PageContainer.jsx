import { cn } from "@/lib/utils";

const PageContainer = ({ children, className }) => (
    <div className={cn("space-y-6", className)}>{children}</div>
);

export default PageContainer;
