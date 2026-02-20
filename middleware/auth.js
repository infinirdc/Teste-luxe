/**
 * Authentication Middleware
 * Verifies JWT tokens and sets user context
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { sendUnauthorized } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header and verifies it
 * Sets req.user with decoded token data
 */
function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            logger.warn('Missing authorization header', { path: req.path, ip: req.ip });
            return sendUnauthorized(res, 'Authorization header required');
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            logger.warn('Missing token', { path: req.path, ip: req.ip });
            return sendUnauthorized(res, 'Token required');
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        logger.debug('Token verified', { userId: decoded.userId, role: decoded.role });
        next();

    } catch (error) {
        logger.warn('Token verification failed', {
            error: error.message,
            path: req.path,
            ip: req.ip
        });

        if (error.name === 'TokenExpiredError') {
            return sendUnauthorized(res, 'Token expired');
        }

        if (error.name === 'JsonWebTokenError') {
            return sendUnauthorized(res, 'Invalid token');
        }

        return sendUnauthorized(res, 'Authentication failed');
    }
}

/**
 * Middleware to check if user is admin
 * Must be used after verifyToken
 */
function requireAdmin(req, res, next) {
    if (!req.user) {
        return sendUnauthorized(res, 'Not authenticated');
    }

    if (req.user.role !== 'admin') {
        logger.warn('Unauthorized admin access attempt', {
            userId: req.user.userId,
            path: req.path,
            method: req.method,
            ip: req.ip
        });
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
}

/**
 * Middleware to check if user is visitor or admin
 * Allows both roles
 */
function requireAuth(req, res, next) {
    if (!req.user) {
        return sendUnauthorized(res, 'Not authenticated');
    }
    next();
}

module.exports = {
    verifyToken,
    requireAdmin,
    requireAuth
};
