/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */

const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Must be registered last in middleware chain
 */
function errorHandler(err, req, res, next) {
    // Log error
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: req.user?.userId || 'anonymous'
    });

    // MongoDB validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors)
            .map(err => err.message)
            .join(', ');

        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: messages
        });
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // CastError (invalid MongoDB ID)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // CORS error
    if (err.message === 'CORS policy: Origin not allowed') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation'
        });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    // Don't expose detailed error messages in production
    const responseMessage = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : message;

    res.status(statusCode).json({
        success: false,
        message: responseMessage,
        ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
}

/**
 * 404 Not Found handler
 * Must be registered before error handler
 */
function notFoundHandler(req, res) {
    logger.warn('Route not found', {
        method: req.method,
        path: req.path,
        ip: req.ip
    });

    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path
    });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error handler
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
