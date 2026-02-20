/**
 * Authentication Controller
 * Handles user registration, login, and authentication logic
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { sendSuccess, sendError, sendConflict, sendValidationError } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Generate JWT token
 */
function generateToken(userId, phone, role) {
    return jwt.sign(
        { userId, phone, role },
        config.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

/**
 * User registration (visitor)
 */
const register = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;

    logger.info('Registration attempt', { phone });

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
        logger.warn('Registration failed: phone already exists', { phone });
        return sendConflict(res, 'Phone number already registered');
    }

    // Create new user
    const user = new User({
        name,
        phone,
        role: 'visitor'
    });

    await user.save();
    logger.info('User registered successfully', { userId: user._id, phone });

    // Generate token
    const token = generateToken(user._id.toString(), phone, 'visitor');

    sendSuccess(res, 201, 'Registration successful', {
        token,
        user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role
        }
    });
});

/**
 * User login (visitor)
 */
const login = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    logger.info('Login attempt', { phone });

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
        logger.warn('Login failed: user not found', { phone });
        return sendError(res, 401, 'Invalid phone or password (user not found)', 'AUTH_FAILED');
    }

    logger.info('User login successful', { userId: user._id, phone });

    // Generate token
    const token = generateToken(user._id.toString(), phone, user.role);

    sendSuccess(res, 200, 'Login successful', {
        token,
        user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role
        }
    });
});

/**
 * Admin login (with credentials)
 */
const adminLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    logger.info('Admin login attempt', { username });

    // Verify credentials against environment variables
    if (username !== config.ADMIN_USERNAME || password !== config.ADMIN_PASSWORD) {
        logger.warn('Admin login failed: invalid credentials', { username });
        return sendError(res, 401, 'Invalid username or password', 'AUTH_FAILED');
    }

    logger.info('Admin login successful', { username });

    // Find or create admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
        adminUser = new User({
            name: 'Administrator',
            phone: 'admin',
            role: 'admin'
        });
        await adminUser.save();
    }

    // Generate token
    const token = generateToken(adminUser._id.toString(), 'admin', 'admin');

    sendSuccess(res, 200, 'Admin login successful', {
        token,
        user: {
            id: adminUser._id,
            name: adminUser.name,
            role: adminUser.role
        }
    });
});

/**
 * Verify token (used to check if token is still valid)
 */
const verifyTokenEndpoint = asyncHandler(async (req, res) => {
    // If we reach here, middleware has already verified the token
    sendSuccess(res, 200, 'Token is valid', {
        user: {
            userId: req.user.userId,
            phone: req.user.phone,
            role: req.user.role
        }
    });
});

module.exports = {
    register,
    login,
    adminLogin,
    verifyTokenEndpoint
};
