import { useState } from "react";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const ReadMore = ({ children, maxLength = 300, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = typeof children === "string" ? children : "";
  const isLong = text.length > maxLength;

  return (
    <div className={className}>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {isExpanded ? text : text.slice(0, maxLength)}
        {isLong && !isExpanded && "..."}
      </p>
      {isLong && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 gap-1 px-0 hover:bg-transparent hover:text-primary"
        >
          {isExpanded ? (
            <>Show less <CaretUpIcon size={16} /></>
          ) : (
            <>Read more <CaretDownIcon size={16} /></>
          )}
        </Button>
      )}
    </div>
  );
};

export default ReadMore;
