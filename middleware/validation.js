/**
 * Input Validation Middleware
 * Validates request data before processing
 */

const validators = require('../utils/validators');
const { sendValidationError } = require('../utils/apiResponse');

/**
 * Validate registration data
 */
function validateRegister(req, res, next) {
    const { name, phone } = req.body;
    const errors = {};

    if (!validators.validateName(name)) {
        errors.name = 'Name must be 2-100 characters without HTML tags';
    }

    if (!validators.validatePhoneNumber(phone)) {
        errors.phone = 'Invalid phone number format';
    }

    if (Object.keys(errors).length > 0) {
        return sendValidationError(res, 'Registration validation failed', errors);
    }

    // Sanitize inputs
    req.body.name = validators.sanitizeInput(name);
    req.body.phone = validators.sanitizeInput(phone);

    next();
}

/**
 * Validate login data
 */
function validateLogin(req, res, next) {
    const { phone } = req.body;
    const errors = {};

    if (!validators.validatePhoneNumber(phone)) {
        errors.phone = 'Invalid phone number format';
    }

    if (Object.keys(errors).length > 0) {
        return sendValidationError(res, 'Login validation failed', errors);
    }

    req.body.phone = validators.sanitizeInput(phone);
    next();
}

/**
 * Validate admin login data
 */
function validateAdminLogin(req, res, next) {
    const { username, password } = req.body;
    const errors = {};

    if (!username || username.length < 2 || username.length > 50) {
        errors.username = 'Username must be 2-50 characters';
    }

    if (!password || password.length < 4 || password.length > 100) {
        errors.password = 'Password must be 4-100 characters';
    }

    if (Object.keys(errors).length > 0) {
        return sendValidationError(res, 'Admin login validation failed', errors);
    }

    next();
}

/**
 * Validate product creation/update data
 */
function validateProduct(req, res, next) {
    const { name, type, price, stock, stockMax, desc, image } = req.body;
    const errors = {};

    if (!validators.validateName(name)) {
        errors.name = 'Name must be 2-100 characters without HTML tags';
    }

    if (!validators.validateProductType(type)) {
        errors.type = 'Invalid product type. Must be: repas, boisson, dessert, or entree';
    }

    if (!validators.validatePrice(price)) {
        errors.price = 'Price must be a positive number';
    }

    if (!validators.validateStock(stock)) {
        errors.stock = 'Stock must be a non-negative integer';
    }

    if (!validators.validateStock(stockMax) || stockMax < stock) {
        errors.stockMax = 'Max stock must be >= current stock';
    }

    if (desc && desc.length > 500) {
        errors.desc = 'Description must not exceed 500 characters';
    }

    if (!validators.validateImageUrl(image)) {
        errors.image = 'Image must be a valid HTTPS URL ending with image extension (.jpg, .png, .webp, etc)';
    }

    if (Object.keys(errors).length > 0) {
        return sendValidationError(res, 'Product validation failed', errors);
    }

    // Sanitize inputs
    req.body.name = validators.sanitizeInput(name);
    req.body.desc = validators.sanitizeInput(desc || '');

    next();
}

/**
 * Validate order creation data
 */
function validateOrderCreation(req, res, next) {
    const { customerName, customerPhone, items, total } = req.body;
    const errors = {};

    if (!validators.validateName(customerName)) {
        errors.customerName = 'Customer name must be 2-100 characters without HTML tags';
    }

    if (!validators.validatePhoneNumber(customerPhone)) {
        errors.customerPhone = 'Invalid phone number format';
    }

    if (!validators.validateOrderItems(items)) {
        errors.items = 'Order must contain at least one valid item with productId, quantity, and price';
    }

    if (!validators.validateOrderTotal(items, total)) {
        errors.total = 'Order total does not match sum of items';
    }

    if (Object.keys(errors).length > 0) {
        return sendValidationError(res, 'Order validation failed', errors);
    }

    // Sanitize inputs
    req.body.customerName = validators.sanitizeInput(customerName);
    req.body.customerPhone = validators.sanitizeInput(customerPhone);

    next();
}

/**
 * Validate order status update
 */
function validateOrderStatusUpdate(req, res, next) {
    const { status } = req.body;
    const errors = {};

    if (!validators.validateOrderStatus(status)) {
        errors.status = 'Invalid status. Must be: pending, confirmed, preparing, ready, delivered, or cancelled';
    }

    if (Object.keys(errors).length > 0) {
        return sendValidationError(res, 'Status validation failed', errors);
    }

    next();
}

/**
 * Sanitize query parameters
 * Prevents MongoDB injection via query strings
 */
function sanitizeQuery(req, res, next) {
    Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
            req.query[key] = validators.sanitizeInput(req.query[key]);
        }
    });
    next();
}

module.exports = {
    validateRegister,
    validateLogin,
    validateAdminLogin,
    validateProduct,
    validateOrderCreation,
    validateOrderStatusUpdate,
    sanitizeQuery
};
