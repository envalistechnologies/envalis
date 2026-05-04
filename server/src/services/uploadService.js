import { uploadBufferToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

export const uploadSingleImage = async (file, folder = "envalis/images", options = {}) => {
    if (!file) throw new Error("No file provided");
    const result = await uploadBufferToCloudinary(file.buffer, folder, {
        transformation: [{ quality: "auto", fetch_format: "auto" }],
        ...options,
    });
    return result;
};

export const uploadMultipleImages = async (files, folder = "envalis/images") => {
    if (!files || files.length === 0) throw new Error("No files provided");
    const uploads = files.map((file) => uploadBufferToCloudinary(file.buffer, folder, {
        transformation: [{ quality: "auto", fetch_format: "auto" }],
    }));
    return Promise.all(uploads);
};

export const uploadDocument = async (file, folder = "envalis/documents") => {
    if (!file) throw new Error("No file provided");
    return uploadBufferToCloudinary(file.buffer, folder, {
        resource_type: "raw",
        use_filename: true,
        unique_filename: true,
    });
};

export const uploadResume = async (file) => {
    return uploadDocument(file, "envalis/resumes");
};

export const deleteMedia = async (publicId) => {
    return deleteFromCloudinary(publicId);
};

export const deleteMultipleMedia = async (publicIds) => {
    return Promise.all(publicIds.map((id) => deleteFromCloudinary(id)));
};