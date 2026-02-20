/**
 * Authentication Routes
 */

const express = require('express');
const authController = require('../controllers/authController');
const validationMiddleware = require('../middleware/validation');
const securityMiddleware = require('../middleware/security');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user (visitor)
 * @access Public
 */
router.post(
    '/register',
    securityMiddleware.loginLimiter,
    validationMiddleware.validateRegister,
    authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login user (visitor)
 * @access Public
 */
router.post(
    '/login',
    securityMiddleware.loginLimiter,
    validationMiddleware.validateLogin,
    authController.login
);

/**
 * @route POST /api/auth/admin/login
 * @desc Login as admin
 * @access Public
 */
router.post(
    '/admin/login',
    securityMiddleware.loginLimiter,
    validationMiddleware.validateAdminLogin,
    authController.adminLogin
);

/**
 * @route GET /api/auth/verify
 * @desc Verify JWT token
 * @access Private
 */
router.get(
    '/verify',
    authMiddleware.verifyToken,
    authController.verifyTokenEndpoint
);

module.exports = router;
