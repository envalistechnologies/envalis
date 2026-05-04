/**
 * Compiles an email template by replacing {{variable}} placeholders with actual values.
 * @param {string} template - HTML or text template string
 * @param {object} variables - Key-value pairs of variables
 * @returns {string} - Compiled string
 */
export const compileTemplate = (template, variables = {}) => {
    if (!template) return "";
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? String(variables[key]) : match;
    });
};

/**
 * Extracts all variable names from a template string
 * @param {string} template - Template string
 * @returns {string[]} - List of variable names
 */
export const extractVariables = (template) => {
    const regex = /\{\{(\w+)\}\}/g;
    const vars = new Set();
    let match;
    while ((match = regex.exec(template)) !== null) {
        vars.add(match[1]);
    }
    return Array.from(vars);
};