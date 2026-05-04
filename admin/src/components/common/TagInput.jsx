import { useState } from "react";
import { X, Plus } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TagInput = ({ value = [], onChange, placeholder = "Add tag and press Enter", label, max = 30, className }) => {
    const [input, setInput] = useState("");

    const addTag = () => {
        const v = input.trim();
        if (!v) return;
        if (value.length >= max) return;
        if (value.includes(v)) return;
        onChange?.([...value, v]);
        setInput("");
    };

    const removeAt = (idx) => onChange?.(value.filter((_, i) => i !== idx));

    return (
        <div className={cn("space-y-2", className)}>
            {label && <p className="text-sm font-medium">{label}</p>}
            <div className="flex flex-wrap gap-1.5 p-2 rounded-md border bg-background min-h-10">
                {value.map((tag, i) => (
                    <Badge key={`${tag}-${i}`} variant="secondary" className="gap-1 pr-1 h-6">
                        {tag}
                        <button type="button" onClick={() => removeAt(i)} className="hover:text-destructive">
                            <X size={11} weight="bold" />
                        </button>
                    </Badge>
                ))}
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addTag();
                        } else if (e.key === "Backspace" && !input && value.length) {
                            removeAt(value.length - 1);
                        }
                    }}
                    placeholder={placeholder}
                    className="flex-1 min-w-30 border-0 shadow-none px-1 h-7 focus-visible:ring-0 focus-visible:border-0"
                />
            </div>
            <p className="text-xs text-muted-foreground">{value.length}/{max} tags</p>
        </div>
    );
};

export default TagInput;
