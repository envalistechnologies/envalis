import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (allowedTypes) => (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowedTypes.includes(ext) || allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type .${ext} is not allowed. Allowed: ${allowedTypes.join(", ")}`), false);
    }
};

export const uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter(["jpg", "jpeg", "png", "webp", "gif", "svg"]),
});

export const uploadDocument = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: fileFilter(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"]),
});

export const uploadAny = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
});

export const uploadResume = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter(["pdf", "doc", "docx"]),
});