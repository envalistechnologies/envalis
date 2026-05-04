import { Badge } from "@/components/ui/badge";

const Tags = ({ tags = [], className = "", variant = "secondary" }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <Badge key={tag} variant={variant} className="rounded-full">
          {tag}
        </Badge>
      ))}
    </div>
  );
};

export default Tags;
