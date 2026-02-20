/**
 * Validation Functions
 * Reusable validators for common data types
 */

/**
 * Validate phone number format
 * Accepts international formats
 */
function validatePhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.trim());
}

/**
 * Validate name (min 2 chars, max 100, no HTML tags)
 */
function validateName(name) {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) return false;
    // Check for HTML tags or dangerous characters
    if (/<[^>]*>/g.test(trimmed)) return false;
    return true;
}

/**
 * Validate price (must be positive number)
 */
function validatePrice(price) {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0;
}

/**
 * Validate stock (must be non-negative integer)
 */
function validateStock(stock) {
    const num = parseInt(stock, 10);
    return Number.isInteger(num) && num >= 0;
}

/**
 * Validate product type
 */
function validateProductType(type) {
    const validTypes = ['repas', 'boisson', 'dessert', 'entree'];
    return validTypes.includes(type);
}

/**
 * Validate order items array
 * Each item must have productId, quantity, price
 */
function validateOrderItems(items) {
    if (!Array.isArray(items) || items.length === 0) return false;

    return items.every(item => {
        if (!item.productId || !item.quantity || item.price === undefined) return false;
        if (!validateStock(item.quantity)) return false;
        if (!validatePrice(item.price)) return false;
        return true;
    });
}

/**
 * Validate order total
 * Must match sum of items (with floating point tolerance)
 */
function validateOrderTotal(items, total) {
    if (!Array.isArray(items) || !items.length) return false;

    const calculatedTotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * parseInt(item.quantity, 10));
    }, 0);

    // Allow 0.01 tolerance for floating point errors
    return Math.abs(parseFloat(total) - calculatedTotal) < 0.01;
}

/**
 * Sanitize string to prevent MongoDB injection
 * Removes operators like $ne, $gt, etc
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    let sanitized = input.trim();
    // Remove MongoDB operators
    sanitized = sanitized.replace(/^\$/.g, '');  // Remove leading $
    sanitized = sanitized.replace(/\{.*\}/g, '');  // Remove braces
    return sanitized;
}

/**
 * Validate URL format (for images)
 */
function validateImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
        const urlObj = new URL(url);
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const pathname = urlObj.pathname.toLowerCase();
        return validExtensions.some(ext => pathname.endsWith(ext));
    } catch {
        return false;
    }
}

/**
 * Validate order status
 */
function validateOrderStatus(status) {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    return validStatuses.includes(status);
}

module.exports = {
    validatePhoneNumber,
    validateName,
    validatePrice,
    validateStock,
    validateProductType,
    validateOrderItems,
    validateOrderTotal,
    validateImageUrl,
    validateOrderStatus,
    sanitizeInput
};
