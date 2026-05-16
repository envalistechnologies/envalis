import { useRef, useState, useEffect } from "react";
import { UploadSimple, Image as ImageIcon, X, Camera } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";

const ImageUploader = ({ value, onChange, label = "Cover Image", description = "PNG, JPG up to 5MB", aspect = "16/9", existingUrl, onRemoveExisting, className, accept = "image/*", maxSize = 5 * 1024 * 1024 }) => {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(existingUrl || null);
    const [isExisting, setIsExisting] = useState(!!existingUrl);
    const [error, setError] = useState("");

    // Sync preview when existingUrl prop changes (e.g. after data loads)
    useEffect(() => {
        if (existingUrl && !value) {
            setPreview(existingUrl);
            setIsExisting(true);
        }
    }, [existingUrl, value]);

    const handleFile = (file) => {
        setError("");
        if (!file) return;
        if (file.size > maxSize) {
            setError(`File too large. Max ${formatBytes(maxSize)}.`);
            return;
        }
        if (!file.type.startsWith("image/")) {
            setError("Please choose an image file.");
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        setIsExisting(false);
        onChange?.(file);
    };

    const handleClear = (e) => {
        e?.stopPropagation();
        // If we're removing an existing server-side image, notify the parent
        if (isExisting) {
            onRemoveExisting?.();
        }
        setPreview(null);
        setIsExisting(false);
        if (inputRef.current) inputRef.current.value = "";
        onChange?.(null);
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && <p className="text-sm font-medium">{label}</p>}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFile(e.dataTransfer.files?.[0]);
                }}
                className="relative group cursor-pointer rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 transition-all overflow-hidden"
                style={{ aspectRatio: aspect }}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <Button type="button" size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                                <Camera size={14} className="mr-1" /> Replace
                            </Button>
                            <Button type="button" size="sm" variant="destructive" onClick={handleClear}>
                                <X size={14} className="mr-1" /> Remove
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
                        <div className="size-12 rounded-full bg-primary/10 grid place-items-center">
                            <UploadSimple size={20} weight="duotone" className="text-primary" />
                        </div>
                        <p className="text-sm font-medium">Click or drag to upload</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                )}
            </div>
            <input ref={inputRef} type="file" hidden accept={accept} onChange={(e) => handleFile(e.target.files?.[0])} />
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
};

export const MultiImageUploader = ({ value = [], onChange, onRemoveExisting, label = "Gallery", maxFiles = 12, accept = "image/*" }) => {
    const inputRef = useRef(null);
    const items = value;

    const handleFiles = (files) => {
        const next = [...items];
        Array.from(files || []).forEach((f) => {
            if (next.length >= maxFiles) return;
            next.push({ file: f, preview: URL.createObjectURL(f) });
        });
        onChange?.(next);
    };

    const removeAt = (idx) => {
        const item = items[idx];
        // If this item has a publicId, it's an existing server-side image — notify parent
        if (item?.publicId) {
            onRemoveExisting?.(item);
        }
        onChange?.(items.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-2">
            {label && <p className="text-sm font-medium">{label} <span className="text-muted-foreground text-xs font-normal">({items.length}/{maxFiles})</span></p>}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {items.map((item, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border group">
                        <img src={item.preview || item.url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeAt(idx)} className="absolute top-1 right-1 size-6 rounded-full bg-black/70 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition">
                            <X size={12} />
                        </button>
                    </div>
                ))}
                {items.length < maxFiles && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 grid place-items-center text-muted-foreground hover:text-primary transition"
                    >
                        <ImageIcon size={20} weight="duotone" />
                    </button>
                )}
            </div>
            <input ref={inputRef} type="file" hidden accept={accept} multiple onChange={(e) => handleFiles(e.target.files)} />
        </div>
    );
};

export default ImageUploader;
