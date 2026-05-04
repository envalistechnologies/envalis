import { useRef, useEffect, useState } from "react";
import {
    TextB, TextItalic, TextUnderline, TextStrikethrough, ListBullets, ListNumbers,
    Quotes, Link as LinkIcon, Code, TextHOne, TextHTwo, TextHThree, TextAlignLeft, TextAlignCenter, TextAlignRight,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const ToolbarButton = ({ icon: Icon, onClick, title, active }) => (
    <Button
        type="button"
        variant={active ? "secondary" : "ghost"}
        size="icon"
        className="size-8"
        onClick={onClick}
        title={title}
    >
        <Icon size={15} weight={active ? "bold" : "regular"} />
    </Button>
);

const RichTextEditor = ({ value = "", onChange, placeholder = "Start writing...", minHeight = 320, label }) => {
    const editorRef = useRef(null);
    const [, force] = useState(0);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value]);

    const exec = (command, arg = null) => {
        document.execCommand(command, false, arg);
        editorRef.current?.focus();
        force((n) => n + 1);
        onChange?.(editorRef.current?.innerHTML || "");
    };

    const handleLink = () => {
        const url = prompt("Enter URL");
        if (url) exec("createLink", url);
    };

    return (
        <div className="space-y-2">
            {label && <p className="text-sm font-medium">{label}</p>}
            <div className="rounded-md border overflow-hidden bg-background">
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30">
                    <ToolbarButton icon={TextHOne} title="Heading 1" onClick={() => exec("formatBlock", "<h1>")} />
                    <ToolbarButton icon={TextHTwo} title="Heading 2" onClick={() => exec("formatBlock", "<h2>")} />
                    <ToolbarButton icon={TextHThree} title="Heading 3" onClick={() => exec("formatBlock", "<h3>")} />
                    <Separator orientation="vertical" className="mx-1 h-5" />
                    <ToolbarButton icon={TextB} title="Bold" onClick={() => exec("bold")} />
                    <ToolbarButton icon={TextItalic} title="Italic" onClick={() => exec("italic")} />
                    <ToolbarButton icon={TextUnderline} title="Underline" onClick={() => exec("underline")} />
                    <ToolbarButton icon={TextStrikethrough} title="Strikethrough" onClick={() => exec("strikeThrough")} />
                    <Separator orientation="vertical" className="mx-1 h-5" />
                    <ToolbarButton icon={ListBullets} title="Bulleted list" onClick={() => exec("insertUnorderedList")} />
                    <ToolbarButton icon={ListNumbers} title="Numbered list" onClick={() => exec("insertOrderedList")} />
                    <ToolbarButton icon={Quotes} title="Quote" onClick={() => exec("formatBlock", "<blockquote>")} />
                    <ToolbarButton icon={Code} title="Code block" onClick={() => exec("formatBlock", "<pre>")} />
                    <Separator orientation="vertical" className="mx-1 h-5" />
                    <ToolbarButton icon={TextAlignLeft} title="Align left" onClick={() => exec("justifyLeft")} />
                    <ToolbarButton icon={TextAlignCenter} title="Align center" onClick={() => exec("justifyCenter")} />
                    <ToolbarButton icon={TextAlignRight} title="Align right" onClick={() => exec("justifyRight")} />
                    <Separator orientation="vertical" className="mx-1 h-5" />
                    <ToolbarButton icon={LinkIcon} title="Insert link" onClick={handleLink} />
                </div>
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
                    data-placeholder={placeholder}
                    className={cn(
                        "outline-none px-4 py-3 prose prose-sm max-w-none dark:prose-invert",
                        "[&[data-placeholder]:empty]:before:content-[attr(data-placeholder)]",
                        "[&[data-placeholder]:empty]:before:text-muted-foreground"
                    )}
                    style={{ minHeight }}
                />
            </div>
        </div>
    );
};

export default RichTextEditor;
