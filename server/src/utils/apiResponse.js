export const successResponse = (res, data = {}, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, ...data });
};

export const errorResponse = (res, message = "Something went wrong", statusCode = 500, errors = null) => {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
};

export const paginatedResponse = (res, data, pagination, message = "Data fetched successfully") => {
    return res.status(200).json({ success: true, message, ...data, pagination });
};

export const buildPaginationQuery = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

export const buildSearchQuery = (searchTerm, fields) => {
    if (!searchTerm) return {};
    return {
        $or: fields.map((field) => ({
            [field]: { $regex: searchTerm, $options: "i" },
        })),
    };
};

export const buildSortQuery = (sortBy, sortOrder = "desc", defaultSort = "createdAt") => {
    const order = sortOrder === "asc" ? 1 : -1;
    return { [sortBy || defaultSort]: order };
};