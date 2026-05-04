import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) { return twMerge(clsx(inputs)); }
export const formatDate = (d) => d ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(d)) : "";
export const formatShortDate = (d) => d ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d)) : "";
export const truncate = (s, n = 120) => s?.length > n ? s.slice(0, n) + "…" : s || "";
export const getInitials = (n) => n?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
export const slugify = (s) => s?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") || "";