import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";
}

export function formatDate(date, opts = {}) {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", ...opts });
}

export function formatDateTime(date) {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatRelative(date) {
    if (!date) return "—";
    const d = new Date(date);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(date);
}

export function formatCurrency(amount, currency = "INR") {
    if (amount == null) return "—";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(n) {
    if (n == null) return "0";
    return new Intl.NumberFormat("en-IN").format(n);
}

export function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let val = bytes;
    while (val >= 1024 && i < units.length - 1) {
        val /= 1024;
        i++;
    }
    return `${val.toFixed(val < 10 ? 1 : 0)} ${units[i]}`;
}

export function truncate(str = "", length = 80) {
    if (!str) return "";
    return str.length > length ? str.slice(0, length).trimEnd() + "…" : str;
}

export function humanize(s = "") {
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function debounce(fn, ms = 300) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

/**
 * Build a FormData object from a plain JS object.
 * Nested objects and arrays of objects are JSON-stringified so the server
 * can parse them back (multer delivers every value as a string anyway).
 * Empty arrays are sent as "[]" so the server can distinguish "clear this
 * list" from "field not provided".
 */
export function buildFormData(obj, formData = new FormData(), parentKey = "") {
    Object.entries(obj || {}).forEach(([key, value]) => {
        const fullKey = parentKey ? `${parentKey}[${key}]` : key;

        // Skip null / undefined (but NOT empty string, false, or 0)
        if (value === null || value === undefined) return;

        if (value instanceof File || value instanceof Blob) {
            formData.append(fullKey, value);
        } else if (Array.isArray(value)) {
            if (value.length === 0) {
                // Send empty arrays as a JSON string so the server knows to clear them
                formData.append(fullKey, "[]");
            } else {
                // Check if it's an array of primitives (strings/numbers)
                const allPrimitive = value.every((v) => typeof v !== "object" || v === null);
                if (allPrimitive) {
                    value.forEach((item) => {
                        if (item instanceof File || item instanceof Blob) {
                            formData.append(fullKey, item);
                        } else {
                            formData.append(fullKey, item);
                        }
                    });
                } else {
                    // Array of objects → JSON-stringify the entire array
                    formData.append(fullKey, JSON.stringify(value));
                }
            }
        } else if (typeof value === "object" && !(value instanceof Date)) {
            // Nested objects → JSON-stringify so multer delivers a parseable string
            formData.append(fullKey, JSON.stringify(value));
        } else {
            formData.append(fullKey, value);
        }
    });
    return formData;
}

/**
 * Show validation errors from react-hook-form as a toast.
 * Use as the second argument to handleSubmit: handleSubmit(onSubmit, onFormError)
 */
export function getFormErrorHandler(toast) {
    return (errors) => {
        const messages = [];
        const collect = (errs, prefix = "") => {
            Object.entries(errs).forEach(([key, val]) => {
                if (val?.message) {
                    messages.push(`${prefix}${humanize(key)}: ${val.message}`);
                } else if (val && typeof val === "object" && !val.ref) {
                    collect(val, `${humanize(key)} › `);
                }
            });
        };
        collect(errors);
        const msg = messages.length > 0
            ? messages.slice(0, 3).join("\n") + (messages.length > 3 ? `\n…and ${messages.length - 3} more` : "")
            : "Please fix the highlighted fields";
        toast.error(msg);
    };
}
