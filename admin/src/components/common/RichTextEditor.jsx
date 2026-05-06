import { useRef, useEffect, useState, useCallback } from "react";

// Icons (inline SVG to avoid any icon library dependency)
const Icon = ({ d, size = 16, stroke = 2 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
);

const Icons = {
    Bold: "M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z",
    Italic: "M19 4h-9M14 20H5M15 4L9 20",
    Underline: ["M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3", "M4 21h16"],
    Strike: ["M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.1 2.3 3.2 2.6C11.3 10.7 13 11 13 13", "M7 17c.9.5 2.1.8 3.5.8 2.5 0 5.2-.8 5.2-3.6 0-1.1-.5-2-1.6-2.7", "M4 4l16 16"],
    Code: ["M16 18l6-6-6-6", "M8 6l-6 6 6 6"],
    H1: null,
    H2: null,
    H3: null,
    BulletList: ["M9 6h11", "M9 12h11", "M9 18h11", "M5 6h.01", "M5 12h.01", "M5 18h.01"],
    OrderedList: ["M10 6h11", "M10 12h11", "M10 18h11", "M4 6h1v4", "M4 10H6", "M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"],
    Quote: "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z",
    AlignLeft: ["M3 6h18", "M3 12h12", "M3 18h15"],
    AlignCenter: ["M3 6h18", "M6 12h12", "M4 18h16"],
    AlignRight: ["M3 6h18", "M9 12h12", "M6 18h15"],
    AlignJustify: ["M3 6h18", "M3 12h18", "M3 18h18"],
    Link: ["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"],
    Unlink: ["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", "M3 3l18 18"],
    Image: ["M15 8h.01", "M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6z", "M3 16l5-5c.928-.893 2.072-.893 3 0l5 5", "M14 14l1-1c.928-.893 2.072-.893 3 0l3 3"],
    Table: ["M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"],
    HR: "M5 12h14",
    Undo: "M9 14 4 9l5-5 M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11",
    Redo: "M15 14l5-5-5-5 M19 9H8.5A5.5 5.5 0 0 0 3 14.5v0A5.5 5.5 0 0 0 8.5 20H13",
    ClearFormat: ["M3.27 3 21 20.73", "M10.97 10.97a3 3 0 1 0 4.06 4.06", "M7.161 7.17c-1.19.275-2.298.91-3.16 1.854A10.007 10.007 0 0 0 2 12c2 5 8 8 10 8 1.399 0 3.735-.845 5.938-2.493"],
    Subscript: ["M4 5h7", "M7 5v13", "M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14.5c0-.667-.333-1-1-1-.514 0-1 .5-1 1v.5"],
    Superscript: ["M4 19h7", "M7 4v13", "M20 9h-4c0-1.5.44-2 1.5-2.5S20 4.33 20 3.5c0-.667-.333-1-1-1-.514 0-1 .5-1 1v.5"],
    Highlight: ["M12 3v6", "M6.657 17H17.343a2 2 0 0 0 1.985-1.752L20 7H4l.672 8.248A2 2 0 0 0 6.657 17z", "M9 17v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3"],
    Palette: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.29-2.333A17.9 17.9 0 0 1 12 20c0-1.105-.895-2-2-2s-2 .895-2 2c0 .67.333 1.262.835 1.628-.228.048-.46.083-.698.107a1.88 1.88 0 0 0-.427-.235z",
    ChevronDown: "M6 9l6 6 6-6",
    Check: "M20 6L9 17l-5-5",
    X: "M18 6L6 18M6 6l12 12",
};

const SWATCHES = [
    { label: "Default", value: "#111827" },
    { label: "Slate", value: "#475569" },
    { label: "Gray", value: "#6b7280" },
    { label: "Red", value: "#dc2626" },
    { label: "Orange", value: "#ea580c" },
    { label: "Amber", value: "#d97706" },
    { label: "Yellow", value: "#ca8a04" },
    { label: "Green", value: "#16a34a" },
    { label: "Teal", value: "#0d9488" },
    { label: "Cyan", value: "#0891b2" },
    { label: "Blue", value: "#2563eb" },
    { label: "Indigo", value: "#4f46e5" },
    { label: "Violet", value: "#7c3aed" },
    { label: "Purple", value: "#9333ea" },
    { label: "Pink", value: "#db2777" },
    { label: "Rose", value: "#e11d48" },
    { label: "White", value: "#ffffff" },
    { label: "Black", value: "#000000" },
];

const HIGHLIGHT_COLORS = [
    { label: "Yellow", value: "#fef08a" },
    { label: "Green", value: "#bbf7d0" },
    { label: "Blue", value: "#bfdbfe" },
    { label: "Pink", value: "#fbcfe8" },
    { label: "Orange", value: "#fed7aa" },
    { label: "Purple", value: "#e9d5ff" },
    { label: "None", value: "transparent" },
];

const FONT_FAMILIES = [
    { label: "Default", value: "" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Times New Roman", value: "'Times New Roman', serif" },
    { label: "Courier New", value: "'Courier New', monospace" },
    { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Verdana", value: "Verdana, sans-serif" },
];

const FONT_SIZES = ["10", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48", "64"];

function rgbToHex(color) {
    if (!color || color === "rgb(0, 0, 0)") return "#000000";
    if (color.startsWith("#")) return color;
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return "#111827";
    return "#" + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, "0")).join("");
}

// Toolbar primitives
const ToolBtn = ({ icon, label, active, disabled, onClick, children, className = "" }) => (
    <button
        type="button"
        title={label}
        disabled={disabled}
        onClick={onClick}
        className={`tb-btn ${active ? "tb-btn--active" : ""} ${className}`}
    >
        {icon && <Icon d={Icons[icon]} size={14} stroke={icon === "Bold" ? 2.5 : 1.8} />}
        {children}
    </button>
);

const Sep = () => <span className="tb-sep" />;

const Group = ({ label, children }) => (
    <div className="tb-group">
        <div className="tb-group__inner">{children}</div>
        {label && <span className="tb-group__label">{label}</span>}
    </div>
);

// Modal
const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div className="rte-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="rte-modal">
                <div className="rte-modal__header">
                    <span>{title}</span>
                    <button className="rte-modal__close" onClick={onClose}>
                        <Icon d={Icons.X} size={16} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

// Dropdown
const Dropdown = ({ trigger, children, open, onToggle, align = "left" }) => (
    <div className="rte-dropdown" style={{ position: "relative" }}>
        <div onClick={onToggle}>{trigger}</div>
        {open && (
            <div
                className={`rte-dropdown__panel rte-dropdown__panel--${align}`}
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
        )}
    </div>
);

// Color Picker Panel
const ColorPanel = ({ current, onApply, onClose, colors = SWATCHES, showCustom = true }) => {
    const [hex, setHex] = useState(current || "#111827");

    return (
        <div className="color-panel">
            <div className="color-panel__grid">
                {colors.map(c => (
                    <button
                        key={c.value}
                        title={c.label}
                        className={`color-swatch ${rgbToHex(current)?.toLowerCase() === c.value.toLowerCase() ? "color-swatch--active" : ""}`}
                        style={{ background: c.value, border: c.value === "#ffffff" ? "1px solid #d1d5db" : undefined }}
                        onMouseDown={e => { e.preventDefault(); onApply(c.value); onClose(); }}
                    />
                ))}
            </div>
            {showCustom && (
                <div className="color-panel__custom">
                    <span>Custom</span>
                    <input
                        type="color"
                        value={hex}
                        onChange={e => setHex(e.target.value)}
                    />
                    <input
                        className="color-panel__hex"
                        value={hex}
                        maxLength={7}
                        onChange={e => {
                            setHex(e.target.value);
                            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onApply(e.target.value);
                        }}
                    />
                    <button
                        className="color-panel__apply"
                        onMouseDown={e => { e.preventDefault(); onApply(hex); onClose(); }}
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
};

// Main RichTextEditor
const RichTextEditor = ({
    value = "",
    onChange,
    placeholder = "Start writing...",
    minHeight = 320,
    label,
}) => {
    const editorRef = useRef(null);
    const savedRange = useRef(null);

    const [state, setState] = useState({
        bold: false, italic: false, underline: false, strike: false,
        subscript: false, superscript: false, code: false,
        ul: false, ol: false, quote: false,
        alignLeft: true, alignCenter: false, alignRight: false, alignJustify: false,
        link: false, block: "Paragraph",
    });

    const [textColor, setTextColor] = useState("#111827");
    const [hlColor, setHlColor] = useState("transparent");
    const [fontSize, setFontSize] = useState("16");
    const [fontFamily, setFontFamily] = useState("");

    const [openPanel, setOpenPanel] = useState(null); // "textColor"|"hlColor"|"fontFamily"|"fontSize"
    const [linkModal, setLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [tableModal, setTableModal] = useState(false);
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);
    const [wordCount, setWordCount] = useState({ words: 0, chars: 0 });

    // ── Selection save/restore ────────────────────────────────────────────────
    const saveRange = useCallback(() => {
        const sel = window.getSelection();
        if (sel?.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
            savedRange.current = sel.getRangeAt(0).cloneRange();
        }
    }, []);

    const restoreRange = useCallback(() => {
        const sel = window.getSelection();
        if (sel && savedRange.current) {
            sel.removeAllRanges();
            sel.addRange(savedRange.current);
        }
    }, []);

    // execCommand wrapper
    const exec = useCallback((cmd, val = null) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, val);
        syncState();
        fireChange();
    }, []);

    const execWithRestore = useCallback((cmd, val = null) => {
        restoreRange();
        editorRef.current?.focus();
        document.execCommand(cmd, false, val);
        syncState();
        fireChange();
    }, []);

    const fireChange = () => onChange?.(editorRef.current?.innerHTML || "");

    // Sync toolbar state from selection
    const syncState = useCallback(() => {
        const ed = editorRef.current;
        if (!ed) return;
        const sel = window.getSelection();
        if (!sel?.anchorNode || !ed.contains(sel.anchorNode)) return;

        const node = sel.anchorNode.nodeType === 1
            ? sel.anchorNode
            : sel.anchorNode.parentElement;

        const ul = node.closest?.("ul");
        const ol = node.closest?.("ol");
        const block = node.closest?.("h1,h2,h3,h4,h5,h6,blockquote,pre,p,li");
        const tag = block?.tagName?.toLowerCase() || "p";

        let blockLabel = "Paragraph";
        if (tag === "h1") blockLabel = "Heading 1";
        else if (tag === "h2") blockLabel = "Heading 2";
        else if (tag === "h3") blockLabel = "Heading 3";
        else if (tag === "h4") blockLabel = "Heading 4";
        else if (tag === "h5") blockLabel = "Heading 5";
        else if (tag === "h6") blockLabel = "Heading 6";
        else if (tag === "blockquote") blockLabel = "Quote";
        else if (tag === "pre") blockLabel = "Code";
        else if (ul) blockLabel = "Bullet List";
        else if (ol) blockLabel = "Ordered List";

        setState({
            bold: document.queryCommandState("bold"),
            italic: document.queryCommandState("italic"),
            underline: document.queryCommandState("underline"),
            strike: document.queryCommandState("strikeThrough"),
            subscript: document.queryCommandState("subscript"),
            superscript: document.queryCommandState("superscript"),
            code: tag === "pre",
            ul: document.queryCommandState("insertUnorderedList") || !!ul,
            ol: document.queryCommandState("insertOrderedList") || !!ol,
            quote: tag === "blockquote",
            alignLeft: document.queryCommandState("justifyLeft"),
            alignCenter: document.queryCommandState("justifyCenter"),
            alignRight: document.queryCommandState("justifyRight"),
            alignJustify: document.queryCommandState("justifyFull"),
            link: !!node.closest?.("a"),
            block: blockLabel,
        });

        const computed = window.getComputedStyle(node);
        setTextColor(rgbToHex(computed.color));
        const bg = computed.backgroundColor;
        setHlColor(bg === "rgba(0, 0, 0, 0)" ? "transparent" : rgbToHex(bg));
        const fz = document.queryCommandValue("fontSize");
        if (fz) setFontSize({ "1": "10", "2": "13", "3": "16", "4": "18", "5": "24", "6": "32", "7": "48" }[fz] || "16");
    }, []);

    // Update word/char count
    const updateCount = useCallback(() => {
        const text = editorRef.current?.innerText || "";
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        setWordCount({ words, chars: text.replace(/\n/g, "").length });
    }, []);

    // Initialise content
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || "";
            updateCount();
        }
    }, [value]);

    // Event listeners
    useEffect(() => {
        const ed = editorRef.current;
        const onSel = () => syncState();
        document.addEventListener("selectionchange", onSel);
        ed?.addEventListener("keyup", syncState);
        ed?.addEventListener("mouseup", syncState);
        ed?.addEventListener("input", updateCount);

        const onKeyDown = e => {
            if ((e.ctrlKey || e.metaKey)) {
                if (e.key === "k") { e.preventDefault(); openLink(); }
            }
        };
        ed?.addEventListener("keydown", onKeyDown);

        const onClickOut = e => {
            if (!e.target.closest(".rte-dropdown")) setOpenPanel(null);
        };
        document.addEventListener("mousedown", onClickOut);

        return () => {
            document.removeEventListener("selectionchange", onSel);
            ed?.removeEventListener("keyup", syncState);
            ed?.removeEventListener("mouseup", syncState);
            ed?.removeEventListener("input", updateCount);
            ed?.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("mousedown", onClickOut);
        };
    }, []);

    // Actions
    const openLink = () => {
        saveRange();
        const sel = window.getSelection();
        const node = sel?.anchorNode?.parentElement?.closest("a");
        setLinkUrl(node?.href || "");
        setLinkModal(true);
    };

    const applyLink = () => {
        const url = linkUrl.trim();
        if (!url) return;
        execWithRestore("createLink", url);
        // make links open in new tab
        requestAnimationFrame(() => {
            editorRef.current?.querySelectorAll("a").forEach(a => {
                a.target = "_blank"; a.rel = "noopener noreferrer";
            });
        });
        setLinkModal(false);
    };

    const insertTable = () => {
        const rows = Math.max(1, tableRows), cols = Math.max(1, tableCols);
        const cell = (tag) => `<${tag} style="border:1px solid #e2e8f0;padding:8px 12px;min-width:80px">&nbsp;</${tag}>`;
        const header = `<tr>${Array(cols).fill(cell("th")).join("")}</tr>`;
        const body = Array(rows - 1).fill(`<tr>${Array(cols).fill(cell("td")).join("")}</tr>`).join("");
        const table = `<table style="border-collapse:collapse;width:100%;margin:8px 0"><thead>${header}</thead><tbody>${body}</tbody></table><p><br></p>`;
        restoreRange();
        editorRef.current?.focus();
        document.execCommand("insertHTML", false, table);
        fireChange();
        setTableModal(false);
    };

    const applyFontSize = (size) => {
        // execCommand fontSize maps 1-7; we use a span trick for px
        execWithRestore("fontSize", "7");
        requestAnimationFrame(() => {
            editorRef.current?.querySelectorAll("font[size='7']").forEach(el => {
                el.removeAttribute("size");
                el.style.fontSize = size + "px";
            });
            fireChange();
        });
        setFontSize(size);
        setOpenPanel(null);
    };

    const applyFontFamily = (family) => {
        execWithRestore("fontName", family || "inherit");
        setFontFamily(family);
        setOpenPanel(null);
    };

    const applyTextColor = (color) => {
        execWithRestore("foreColor", color);
        setTextColor(color);
    };

    const applyHighlight = (color) => {
        execWithRestore("hiliteColor", color === "transparent" ? "inherit" : color);
        setHlColor(color);
    };

    const insertHR = () => {
        exec("insertHTML", "<hr style='border:none;border-top:1px solid #e2e8f0;margin:12px 0'><br>");
    };

    const insertImage = () => {
        const url = prompt("Image URL:");
        if (url) exec("insertImage", url);
    };

    const togglePanel = (name) => {
        saveRange();
        setOpenPanel(p => p === name ? null : name);
    };

    // Block format helper
    const formatBlock = (tag) => exec("formatBlock", tag);

    // Render
    return (
        <>
            <style>{CSS}</style>
            <div className="rte-root">
                {label && <p className="rte-label">{label}</p>}
                <div className="rte-shell">

                    {/* TOOLBAR */}
                    <div className="rte-toolbar">

                        {/* Row 1 */}
                        <div className="rte-toolbar__row">

                            {/* Block Format Dropdown */}
                            <Group label="Format">
                                <Dropdown
                                    open={openPanel === "blockFormat"}
                                    onToggle={() => togglePanel("blockFormat")}
                                    trigger={
                                        <button className="tb-select" type="button">
                                            <span>{state.block}</span>
                                            <Icon d={Icons.ChevronDown} size={12} />
                                        </button>
                                    }
                                >
                                    <div className="rte-dropdown__panel--wide">
                                        {[
                                            { label: "Paragraph", tag: "<p>", style: {} },
                                            { label: "Heading 1", tag: "<h1>", style: { fontSize: "2em", fontWeight: 600 } },
                                            { label: "Heading 2", tag: "<h2>", style: { fontSize: "1.5em", fontWeight: 600 } },
                                            { label: "Heading 3", tag: "<h3>", style: { fontSize: "1.25em", fontWeight: 600 } },
                                            { label: "Heading 4", tag: "<h4>", style: { fontSize: "1.1em", fontWeight: 600 } },
                                            { label: "Heading 5", tag: "<h5>", style: { fontSize: ".9em", fontWeight: 600 } },
                                            { label: "Quote", tag: "<blockquote>", style: { borderLeft: "3px solid #cbd5e1", paddingLeft: 8, fontStyle: "italic", color: "#64748b" } },
                                            { label: "Code", tag: "<pre>", style: { fontFamily: "monospace", background: "#f1f5f9", borderRadius: 4, padding: "2px 6px", fontSize: ".85em" } },
                                        ].map(({ label: l, tag, style }) => (
                                            <button
                                                key={l}
                                                className={`format-option ${state.block === l ? "format-option--active" : ""}`}
                                                onMouseDown={e => { e.preventDefault(); formatBlock(tag); setOpenPanel(null); }}
                                                style={style}
                                            >
                                                {l}
                                                {state.block === l && <Icon d={Icons.Check} size={13} />}
                                            </button>
                                        ))}
                                    </div>
                                </Dropdown>
                            </Group>

                            <Sep />

                            {/* Font Family */}
                            <Group label="Font">
                                <Dropdown
                                    open={openPanel === "fontFamily"}
                                    onToggle={() => togglePanel("fontFamily")}
                                    trigger={
                                        <button className="tb-select tb-select--font" type="button">
                                            <span style={{ fontFamily: fontFamily || "inherit" }}>
                                                {FONT_FAMILIES.find(f => f.value === fontFamily)?.label || "Default"}
                                            </span>
                                            <Icon d={Icons.ChevronDown} size={12} />
                                        </button>
                                    }
                                >
                                    <div className="rte-dropdown__panel--wide">
                                        {FONT_FAMILIES.map(f => (
                                            <button
                                                key={f.label}
                                                className={`format-option ${fontFamily === f.value ? "format-option--active" : ""}`}
                                                style={{ fontFamily: f.value || "inherit" }}
                                                onMouseDown={e => { e.preventDefault(); applyFontFamily(f.value); }}
                                            >
                                                {f.label}
                                                {fontFamily === f.value && <Icon d={Icons.Check} size={13} />}
                                            </button>
                                        ))}
                                    </div>
                                </Dropdown>
                            </Group>

                            <Sep />

                            {/* Font Size */}
                            <Group label="Size">
                                <Dropdown
                                    open={openPanel === "fontSize"}
                                    onToggle={() => togglePanel("fontSize")}
                                    trigger={
                                        <button className="tb-select tb-select--size" type="button">
                                            <span>{fontSize}px</span>
                                            <Icon d={Icons.ChevronDown} size={12} />
                                        </button>
                                    }
                                >
                                    <div className="rte-dropdown__panel--size">
                                        {FONT_SIZES.map(s => (
                                            <button
                                                key={s}
                                                className={`format-option format-option--size ${fontSize === s ? "format-option--active" : ""}`}
                                                onMouseDown={e => { e.preventDefault(); applyFontSize(s); }}
                                            >
                                                {s}px
                                            </button>
                                        ))}
                                    </div>
                                </Dropdown>
                            </Group>

                            <Sep />

                            {/* Text Color */}
                            <Group label="Color">
                                <Dropdown
                                    open={openPanel === "textColor"}
                                    align="left"
                                    onToggle={() => togglePanel("textColor")}
                                    trigger={
                                        <button className="tb-color-btn" type="button" title="Text color">
                                            <Icon d={Icons.Palette} size={14} stroke={1.5} />
                                            <span className="tb-color-swatch" style={{ background: textColor, border: textColor === "#ffffff" ? "1px solid #d1d5db" : "none" }} />
                                        </button>
                                    }
                                >
                                    <ColorPanel
                                        current={textColor}
                                        onApply={applyTextColor}
                                        onClose={() => setOpenPanel(null)}
                                    />
                                </Dropdown>

                                {/* Highlight Color */}
                                <Dropdown
                                    open={openPanel === "hlColor"}
                                    align="left"
                                    onToggle={() => togglePanel("hlColor")}
                                    trigger={
                                        <button className="tb-color-btn" type="button" title="Highlight color">
                                            <Icon d={Icons.Highlight} size={14} stroke={1.5} />
                                            <span className="tb-color-swatch" style={{
                                                background: hlColor === "transparent" ? "linear-gradient(135deg, #fff 45%, #e11d48 45%)" : hlColor,
                                                border: "1px solid #d1d5db"
                                            }} />
                                        </button>
                                    }
                                >
                                    <ColorPanel
                                        current={hlColor}
                                        onApply={applyHighlight}
                                        onClose={() => setOpenPanel(null)}
                                        colors={HIGHLIGHT_COLORS}
                                        showCustom={false}
                                    />
                                </Dropdown>
                            </Group>

                            <Sep />

                            {/* History */}
                            <Group label="History">
                                <ToolBtn icon="Undo" label="Undo (Ctrl+Z)" onClick={() => exec("undo")} />
                                <ToolBtn icon="Redo" label="Redo (Ctrl+Y)" onClick={() => exec("redo")} />
                                <ToolBtn icon="ClearFormat" label="Clear formatting" onClick={() => exec("removeFormat")} />
                            </Group>
                        </div>

                        {/* Divider */}
                        <div className="rte-toolbar__divider" />

                        {/* Row 2 */}
                        <div className="rte-toolbar__row">

                            {/* Text Style */}
                            <Group label="Style">
                                <ToolBtn icon="Bold" label="Bold (Ctrl+B)" active={state.bold} onClick={() => exec("bold")} />
                                <ToolBtn icon="Italic" label="Italic (Ctrl+I)" active={state.italic} onClick={() => exec("italic")} />
                                <ToolBtn icon="Underline" label="Underline (Ctrl+U)" active={state.underline} onClick={() => exec("underline")} />
                                <ToolBtn icon="Strike" label="Strikethrough" active={state.strike} onClick={() => exec("strikeThrough")} />
                                <ToolBtn icon="Subscript" label="Subscript" active={state.subscript} onClick={() => exec("subscript")} />
                                <ToolBtn icon="Superscript" label="Superscript" active={state.superscript} onClick={() => exec("superscript")} />
                                <ToolBtn icon="Code" label="Code block" active={state.code} onClick={() => formatBlock("<pre>")} />
                            </Group>

                            <Sep />

                            {/* Lists */}
                            <Group label="Lists">
                                <ToolBtn icon="BulletList" label="Bullet list" active={state.ul} onClick={() => exec("insertUnorderedList")} />
                                <ToolBtn icon="OrderedList" label="Numbered list" active={state.ol} onClick={() => exec("insertOrderedList")} />
                                <ToolBtn icon="Quote" label="Blockquote" active={state.quote} onClick={() => formatBlock("<blockquote>")} />
                            </Group>

                            <Sep />

                            {/* Indent */}
                            <Group label="Indent">
                                <ToolBtn label="Indent" onClick={() => exec("indent")}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 8 7 12 3 16" /><line x1="21" y1="12" x2="7" y2="12" />
                                        <line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="18" x2="3" y2="18" />
                                    </svg>
                                </ToolBtn>
                                <ToolBtn label="Outdent" onClick={() => exec("outdent")}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="7 8 3 12 7 16" /><line x1="21" y1="12" x2="3" y2="12" />
                                        <line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="18" x2="3" y2="18" />
                                    </svg>
                                </ToolBtn>
                            </Group>

                            <Sep />

                            {/* Alignment */}
                            <Group label="Align">
                                <ToolBtn icon="AlignLeft" label="Align left" active={state.alignLeft} onClick={() => exec("justifyLeft")} />
                                <ToolBtn icon="AlignCenter" label="Align center" active={state.alignCenter} onClick={() => exec("justifyCenter")} />
                                <ToolBtn icon="AlignRight" label="Align right" active={state.alignRight} onClick={() => exec("justifyRight")} />
                                <ToolBtn icon="AlignJustify" label="Justify" active={state.alignJustify} onClick={() => exec("justifyFull")} />
                            </Group>

                            <Sep />

                            {/* Insert */}
                            <Group label="Insert">
                                <ToolBtn icon="Link" label="Insert link (Ctrl+K)" active={state.link} onClick={openLink} />
                                <ToolBtn icon="Unlink" label="Remove link" onClick={() => exec("unlink")} />
                                <ToolBtn icon="Image" label="Insert image" onClick={insertImage} />
                                <ToolBtn icon="Table" label="Insert table" onClick={() => { saveRange(); setTableModal(true); }} />
                                <ToolBtn icon="HR" label="Horizontal rule" onClick={insertHR} />
                            </Group>

                        </div>
                    </div>

                    {/* EDITOR AREA */}
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        data-placeholder={placeholder}
                        className="rte-editor"
                        style={{ minHeight }}
                        onInput={fireChange}
                    />

                    {/* STATUS BAR */}
                    <div className="rte-statusbar">
                        <span>{wordCount.words} word{wordCount.words !== 1 ? "s" : ""}</span>
                        <span>·</span>
                        <span>{wordCount.chars} chars</span>
                        <span className="rte-statusbar__state">{state.block}</span>
                    </div>
                </div>

                {/* LINK MODAL */}
                <Modal open={linkModal} onClose={() => setLinkModal(false)} title="Insert link">
                    <div className="rte-modal__body">
                        <label className="rte-modal__label">URL</label>
                        <input
                            className="rte-modal__input"
                            value={linkUrl}
                            autoFocus
                            placeholder="https://example.com"
                            onChange={e => setLinkUrl(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setLinkModal(false); }}
                        />
                    </div>
                    <div className="rte-modal__footer">
                        <button className="rte-btn" onClick={() => setLinkModal(false)}>Cancel</button>
                        <button className="rte-btn rte-btn--primary" onClick={applyLink}>Apply</button>
                    </div>
                </Modal>

                {/* TABLE MODAL */}
                <Modal open={tableModal} onClose={() => setTableModal(false)} title="Insert table">
                    <div className="rte-modal__body rte-modal__body--row">
                        <div>
                            <label className="rte-modal__label">Rows</label>
                            <input
                                type="number" min="1" max="20" className="rte-modal__input rte-modal__input--sm"
                                value={tableRows} onChange={e => setTableRows(+e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="rte-modal__label">Columns</label>
                            <input
                                type="number" min="1" max="10" className="rte-modal__input rte-modal__input--sm"
                                value={tableCols} onChange={e => setTableCols(+e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="rte-modal__footer">
                        <button className="rte-btn" onClick={() => setTableModal(false)}>Cancel</button>
                        <button className="rte-btn rte-btn--primary" onClick={insertTable}>Insert</button>
                    </div>
                </Modal>
            </div>
        </>
    );
};

// CSS
const CSS = `
  .rte-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .rte-label { font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
  .rte-shell { border: 1px solid #e2e8f0; border-radius: 10px; overflow: visible; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.04); }

  /* ── Toolbar ── */
  .rte-toolbar { background: #f8fafc; border-bottom: 1px solid #e2e8f0; border-radius: 10px 10px 0 0; padding: 0; }
  .rte-toolbar__row { display: flex; align-items: center; flex-wrap: wrap; gap: 1px; padding: 5px 10px; }
  .rte-toolbar__divider { height: 1px; background: #e2e8f0; margin: 0; }

  /* ── Groups ── */
  .tb-group { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .tb-group__inner { display: flex; align-items: center; gap: 1px; }
  .tb-group__label { font-size: 9px; color: #94a3b8; letter-spacing: .04em; text-transform: uppercase; line-height: 1; }

  /* ── Toolbar button ── */
  .tb-btn {
    background: transparent; border: none; cursor: pointer; border-radius: 5px;
    width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
    color: #475569; transition: background .12s, color .12s;
  }
  .tb-btn:hover { background: #e2e8f0; color: #0f172a; }
  .tb-btn--active { background: #e0e7ff; color: #4338ca; }
  .tb-btn--active:hover { background: #c7d2fe; color: #3730a3; }

  /* ── Select triggers ── */
  .tb-select {
    display: inline-flex; align-items: center; gap: 6px; height: 28px;
    border: 1px solid #e2e8f0; border-radius: 5px; padding: 0 8px;
    font-size: 12px; color: #374151; background: #fff; cursor: pointer;
    min-width: 110px; justify-content: space-between; white-space: nowrap;
    transition: border-color .12s;
  }
  .tb-select--font { min-width: 120px; }
  .tb-select--size { min-width: 68px; }
  .tb-select:hover { border-color: #94a3b8; }
  .tb-select svg { flex-shrink: 0; color: #94a3b8; }

  /* ── Color buttons ── */
  .tb-color-btn {
    display: inline-flex; align-items: center; gap: 3px; height: 28px;
    background: transparent; border: none; cursor: pointer; border-radius: 5px;
    padding: 0 5px; color: #475569; transition: background .12s;
  }
  .tb-color-btn:hover { background: #e2e8f0; }
  .tb-color-swatch { width: 12px; height: 12px; border-radius: 2px; display: inline-block; }

  /* ── Separator ── */
  .tb-sep { width: 1px; height: 20px; background: #e2e8f0; margin: 0 5px; flex-shrink: 0; }

  /* ── Dropdowns ── */
  .rte-dropdown { position: relative; }
  .rte-dropdown__panel {
    position: absolute; top: calc(100% + 6px); left: 0; z-index: 1000;
    background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,.10), 0 2px 6px rgba(0,0,0,.06);
    min-width: 160px; overflow: hidden;
  }
  .rte-dropdown__panel--right { left: auto; right: 0; }
  .rte-dropdown__panel--wide { min-width: 180px; }
  .rte-dropdown__panel--size { min-width: 100px; display: grid; grid-template-columns: 1fr 1fr; }

  .format-option {
    display: flex; align-items: center; justify-content: space-between; width: 100%;
    padding: 8px 12px; font-size: 13px; color: #374151; background: transparent;
    border: none; cursor: pointer; text-align: left; transition: background .1s;
  }
  .format-option:hover { background: #f1f5f9; }
  .format-option--active { color: #4338ca; background: #eef2ff; }
  .format-option--size { justify-content: center; font-size: 12px; padding: 7px 8px; }

  /* ── Color Panel ── */
  .color-panel { padding: 10px; min-width: 200px; }
  .color-panel__grid { display: grid; grid-template-columns: repeat(9, 1fr); gap: 5px; margin-bottom: 8px; }
  .color-swatch {
    width: 100%; aspect-ratio: 1; border-radius: 4px; cursor: pointer;
    border: 1px solid transparent; transition: transform .1s, box-shadow .1s;
  }
  .color-swatch:hover { transform: scale(1.12); box-shadow: 0 0 0 2px #94a3b8; }
  .color-swatch--active { box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px #4338ca !important; }
  .color-panel__custom { display: flex; align-items: center; gap: 6px; padding-top: 8px; border-top: 1px solid #f1f5f9; }
  .color-panel__custom span { font-size: 11px; color: #94a3b8; white-space: nowrap; }
  .color-panel__custom input[type="color"] { width: 28px; height: 28px; border-radius: 4px; border: 1px solid #e2e8f0; cursor: pointer; padding: 1px; }
  .color-panel__hex { flex: 1; font-family: monospace; font-size: 11px; border: 1px solid #e2e8f0; border-radius: 5px; padding: 4px 6px; outline: none; color: #374151; }
  .color-panel__hex:focus { border-color: #818cf8; }
  .color-panel__apply { font-size: 11px; padding: 4px 10px; border: 1px solid #e2e8f0; border-radius: 5px; background: #fff; cursor: pointer; white-space: nowrap; }
  .color-panel__apply:hover { background: #f1f5f9; }

  /* ── Editor ── */
  .rte-editor {
    outline: none; padding: 18px 22px; color: #0f172a; font-size: 15px;
    line-height: 1.75; border-radius: 0 0 10px 10px; overflow-y: auto;
  }
  .rte-editor:empty:before { content: attr(data-placeholder); color: #94a3b8; pointer-events: none; display: block; }
  .rte-editor h1 { font-size: 2em;    font-weight: 700; margin: 16px 0 8px; color: #0f172a; }
  .rte-editor h2 { font-size: 1.5em;  font-weight: 600; margin: 14px 0 6px; color: #0f172a; }
  .rte-editor h3 { font-size: 1.25em; font-weight: 600; margin: 12px 0 5px; color: #1e293b; }
  .rte-editor h4 { font-size: 1.1em;  font-weight: 600; margin: 10px 0 4px; color: #1e293b; }
  .rte-editor h5 { font-size: .9em;   font-weight: 600; margin: 8px 0 4px;  color: #334155; text-transform: uppercase; letter-spacing: .06em; }
  .rte-editor h6 { font-size: .8em;   font-weight: 600; margin: 8px 0 4px;  color: #475569; }
  .rte-editor p  { margin: 4px 0; }
  .rte-editor blockquote { border-left: 3px solid #cbd5e1; padding: 4px 0 4px 16px; color: #64748b; font-style: italic; margin: 8px 0; }
  .rte-editor pre { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 13px; overflow-x: auto; margin: 8px 0; color: #0f172a; }
  .rte-editor ul { list-style: disc;    padding-left: 24px; margin: 4px 0; }
  .rte-editor ol { list-style: decimal; padding-left: 24px; margin: 4px 0; }
  .rte-editor li { margin: 2px 0; }
  .rte-editor a  { color: #4338ca; text-decoration: underline; }
  .rte-editor table { border-collapse: collapse; width: 100%; margin: 8px 0; }
  .rte-editor th, .rte-editor td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
  .rte-editor th { background: #f8fafc; font-weight: 600; }
  .rte-editor img { max-width: 100%; border-radius: 6px; }

  /* ── Status bar ── */
  .rte-statusbar {
    display: flex; align-items: center; gap: 6px; padding: 5px 14px;
    border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;
    border-radius: 0 0 10px 10px; background: #f8fafc;
  }
  .rte-statusbar__state { margin-left: auto; background: #e0e7ff; color: #4338ca; font-size: 10px; padding: 2px 7px; border-radius: 4px; }

  /* ── Modal overlay ── */
  .rte-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.3); z-index: 9000;
    display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px);
  }
  .rte-modal { background: #fff; border-radius: 10px; width: 380px; box-shadow: 0 20px 50px rgba(0,0,0,.15); overflow: hidden; }
  .rte-modal__header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a; }
  .rte-modal__close { background: none; border: none; cursor: pointer; color: #94a3b8; border-radius: 5px; padding: 3px; display: flex; }
  .rte-modal__close:hover { color: #374151; background: #f1f5f9; }
  .rte-modal__body { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
  .rte-modal__body--row { flex-direction: row; gap: 16px; }
  .rte-modal__label { font-size: 12px; font-weight: 500; color: #64748b; margin-bottom: 4px; display: block; }
  .rte-modal__input { width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; font-size: 13px; outline: none; color: #0f172a; background: #f8fafc; }
  .rte-modal__input--sm { width: 80px; }
  .rte-modal__input:focus { border-color: #818cf8; background: #fff; }
  .rte-modal__footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid #f1f5f9; }
  .rte-btn { border: 1px solid #e2e8f0; border-radius: 6px; padding: 7px 14px; font-size: 13px; cursor: pointer; background: #fff; color: #374151; transition: background .12s; }
  .rte-btn:hover { background: #f1f5f9; }
  .rte-btn--primary { background: #4338ca; color: #fff; border-color: transparent; }
  .rte-btn--primary:hover { background: #3730a3; }
`;

export default RichTextEditor;