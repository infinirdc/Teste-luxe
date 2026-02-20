/**
 * Statistics Routes
 */

const express = require('express');
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/stats/dashboard
 * @desc Get dashboard statistics (admin only)
 * @access Private (admin)
 */
router.get(
    '/dashboard',
    authMiddleware.verifyToken,
    authMiddleware.requireAdmin,
    statsController.getDashboardStats
);

/**
 * @route GET /api/stats/products
 * @desc Get product analytics (admin only)
 * @access Private (admin)
 */
router.get(
    '/products',
    authMiddleware.verifyToken,
    authMiddleware.requireAdmin,
    statsController.getProductAnalytics
);

/**
 * @route GET /api/stats/trends
 * @desc Get order trends (admin only)
 * @access Private (admin)
 */
router.get(
    '/trends',
    authMiddleware.verifyToken,
    authMiddleware.requireAdmin,
    statsController.getOrderTrends
);

module.exports = router;
