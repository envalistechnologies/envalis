import { useRef, useEffect, useState } from "react";
import {
    TextB, TextItalic, TextUnderline, TextStrikethrough, ListBullets, ListNumbers,
    Quotes, Link as LinkIcon, Code, TextHOne, TextHTwo, TextHThree, TextAlignLeft, TextAlignCenter, TextAlignRight,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { richTextContentClassName } from "@/components/common/RichTextContent";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const ToolbarButton = ({ icon: Icon, onClick, title, active }) => (
    <Button
        type="button"
        variant={active ? "secondary" : "ghost"}
        size="icon"
        className={cn("size-8", active && "ring-1 ring-border shadow-sm")}
        onClick={onClick}
        title={title}
    >
        <Icon size={15} weight={active ? "bold" : "regular"} />
    </Button>
);

const defaultToolbarState = {
    block: "Paragraph",
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    bulletList: false,
    numberedList: false,
    quote: false,
    code: false,
    align: "Left",
    link: false,
};

const RichTextEditor = ({ value = "", onChange, placeholder = "Start writing...", minHeight = 320, label }) => {
    const editorRef = useRef(null);
    const savedRangeRef = useRef(null);
    const [toolbarState, setToolbarState] = useState(defaultToolbarState);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    const updateToolbarState = () => {
        const editor = editorRef.current;
        if (!editor) return;

        const selection = window.getSelection();
        const anchorNode = selection?.anchorNode;
        if (!selection || !anchorNode || !editor.contains(anchorNode)) {
            setToolbarState(defaultToolbarState);
            return;
        }

        const getClosestElement = (node) => {
            let current = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
            while (current && current !== editor) {
                if (current.nodeType === Node.ELEMENT_NODE) return current;
                current = current.parentElement;
            }
            return editor;
        };

        const currentElement = getClosestElement(anchorNode);
        const listElement = currentElement?.closest?.("ul,ol");
        const blockTag = currentElement?.closest?.("h1,h2,h3,blockquote,pre,p,li")?.tagName?.toLowerCase() || "p";

        let blockLabel = "Paragraph";
        if (blockTag === "h1") blockLabel = "H1";
        else if (blockTag === "h2") blockLabel = "H2";
        else if (blockTag === "h3") blockLabel = "H3";
        else if (blockTag === "blockquote") blockLabel = "Quote";
        else if (blockTag === "pre") blockLabel = "Code";
        else if (listElement?.tagName?.toLowerCase() === "ul") blockLabel = "Bulleted List";
        else if (listElement?.tagName?.toLowerCase() === "ol") blockLabel = "Numbered List";

        const align = document.queryCommandState("justifyCenter")
            ? "Center"
            : document.queryCommandState("justifyRight")
                ? "Right"
                : "Left";

        const linkNode = currentElement?.closest?.("a") || (currentElement?.tagName?.toLowerCase() === "a" ? currentElement : null);

        setToolbarState({
            block: blockLabel,
            bold: document.queryCommandState("bold"),
            italic: document.queryCommandState("italic"),
            underline: document.queryCommandState("underline"),
            strike: document.queryCommandState("strikeThrough"),
            bulletList: document.queryCommandState("insertUnorderedList") || listElement?.tagName?.toLowerCase() === "ul",
            numberedList: document.queryCommandState("insertOrderedList") || listElement?.tagName?.toLowerCase() === "ol",
            quote: blockTag === "blockquote",
            code: blockTag === "pre",
            align,
            link: !!linkNode,
        });
    };

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || "";
        }
        updateToolbarState();
    }, [value]);

    useEffect(() => {
        const handleSelectionChange = () => updateToolbarState();
        const handleMouseUp = () => updateToolbarState();
        const handleKeyUp = () => updateToolbarState();

        document.addEventListener("selectionchange", handleSelectionChange);
        editorRef.current?.addEventListener("mouseup", handleMouseUp);
        editorRef.current?.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
            editorRef.current?.removeEventListener("mouseup", handleMouseUp);
            editorRef.current?.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const exec = (command, arg = null) => {
        document.execCommand(command, false, arg);
        editorRef.current?.focus();
        onChange?.(editorRef.current?.innerHTML || "");
        requestAnimationFrame(updateToolbarState);
    };

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
        }
    };

    const restoreSelection = () => {
        const selection = window.getSelection();
        const range = savedRangeRef.current;
        if (!selection || !range) return;

        selection.removeAllRanges();
        selection.addRange(range);
    };

    const handleLink = () => {
        saveSelection();
        setLinkUrl("");
        setLinkDialogOpen(true);
    };

    const submitLink = (event) => {
        event.preventDefault();

        const url = linkUrl.trim();
        if (!url) return;

        restoreSelection();
        editorRef.current?.focus();
        exec("createLink", url);
        setLinkDialogOpen(false);
    };

    return (
        <div className="space-y-2">
            {label && <p className="text-sm font-medium">{label}</p>}
            <div className="rounded-md border overflow-hidden bg-background">
                <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 border-b bg-muted/30">
                    <span className="inline-flex items-center rounded-md border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground">
                        {toolbarState.block}
                    </span>
                    <ToolbarButton icon={TextHOne} title="Heading 1" onClick={() => exec("formatBlock", "<h1>")} />
                    <ToolbarButton icon={TextHTwo} title="Heading 2" onClick={() => exec("formatBlock", "<h2>")} />
                    <ToolbarButton icon={TextHThree} title="Heading 3" onClick={() => exec("formatBlock", "<h3>")} />
                    <Separator orientation="vertical" className="mx-1 h-5" />
                    <ToolbarButton icon={TextB} title="Bold" active={toolbarState.bold} onClick={() => exec("bold")} />
                    <ToolbarButton icon={TextItalic} title="Italic" active={toolbarState.italic} onClick={() => exec("italic")} />
                    <ToolbarButton icon={TextUnderline} title="Underline" active={toolbarState.underline} onClick={() => exec("underline")} />
                    <ToolbarButton icon={TextStrikethrough} title="Strikethrough" active={toolbarState.strike} onClick={() => exec("strikeThrough")} />
                    <Separator orientation="vertical" className="mx-1 h-5" />
                    <ToolbarButton icon={ListBullets} title="Bulleted list" active={toolbarState.bulletList} onClick={() => exec("insertUnorderedList")} />
                    <ToolbarButton icon={ListNumbers} title="Numbered list" active={toolbarState.numberedList} onClick={() => exec("insertOrderedList")} />
                    <ToolbarButton icon={Quotes} title="Quote" active={toolbarState.quote} onClick={() => exec("formatBlock", "<blockquote>")} />
                    <ToolbarButton icon={Code} title="Code block" active={toolbarState.code} onClick={() => exec("formatBlock", "<pre>")} />
                    <Separator orientation="vertical" className="mx-1 h-5" />
                    <ToolbarButton icon={TextAlignLeft} title="Align left" active={toolbarState.align === "Left"} onClick={() => exec("justifyLeft")} />
                    <ToolbarButton icon={TextAlignCenter} title="Align center" active={toolbarState.align === "Center"} onClick={() => exec("justifyCenter")} />
                    <ToolbarButton icon={TextAlignRight} title="Align right" active={toolbarState.align === "Right"} onClick={() => exec("justifyRight")} />
                    <Separator orientation="vertical" className="mx-1 h-5" />
                    <ToolbarButton icon={LinkIcon} title="Insert link" active={toolbarState.link} onClick={handleLink} />
                </div>
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
                    data-placeholder={placeholder}
                    className={cn(
                        richTextContentClassName,
                        "outline-none px-4 py-3",
                        "[&[data-placeholder]:empty]:before:content-[attr(data-placeholder)]",
                        "[&[data-placeholder]:empty]:before:text-muted-foreground"
                    )}
                    style={{ minHeight }}
                />
            </div>

            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogContent>
                    <form onSubmit={submitLink} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Insert Link</DialogTitle>
                            <DialogDescription>
                                Add a URL to the selected text.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <label htmlFor="rich-text-link" className="text-sm font-medium">
                                URL
                            </label>
                            <Input
                                id="rich-text-link"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setLinkDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Apply</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RichTextEditor;
