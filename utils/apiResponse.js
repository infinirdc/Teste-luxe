/**
 * API Response Formatter
 * Standardized responses for all API endpoints
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Message to client
 * @param {Any} data - Response data
 */
function sendSuccess(res, statusCode = 200, message = 'Success', data = null) {
    res.status(statusCode).json({
        success: true,
        message,
        data: data || undefined
    });
}

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {String} error - Error type/code
 */
function sendError(res, statusCode = 500, message = 'Internal server error', error = null) {
    res.status(statusCode).json({
        success: false,
        message,
        error: error || undefined
    });
}

/**
 * Validation error response (400)
 */
function sendValidationError(res, message = 'Validation failed', errors = null) {
    res.status(400).json({
        success: false,
        message,
        errors: errors || undefined
    });
}

/**
 * Unauthorized error response (401)
 */
function sendUnauthorized(res, message = 'Unauthorized') {
    res.status(401).json({
        success: false,
        message
    });
}

/**
 * Forbidden error response (403)
 */
function sendForbidden(res, message = 'Forbidden') {
    res.status(403).json({
        success: false,
        message
    });
}

/**
 * Not found error response (404)
 */
function sendNotFound(res, message = 'Resource not found') {
    res.status(404).json({
        success: false,
        message
    });
}

/**
 * Conflict error response (409)
 */
function sendConflict(res, message = 'Resource already exists') {
    res.status(409).json({
        success: false,
        message
    });
}

module.exports = {
    sendSuccess,
    sendError,
    sendValidationError,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendConflict
};
