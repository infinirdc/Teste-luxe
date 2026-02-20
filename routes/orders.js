/**
 * Order Routes
 */

const express = require('express');
const orderController = require('../controllers/orderController');
const validationMiddleware = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/orders
 * @desc Create new order
 * @access Public
 */
router.post(
    '/',
    validationMiddleware.validateOrderCreation,
    orderController.createOrder
);

/**
 * @route GET /api/orders/user/:phone
 * @desc Get orders for a customer
 * @access Public
 */
router.get(
    '/user/:phone',
    validationMiddleware.sanitizeQuery,
    orderController.getCustomerOrders
);

/**
 * @route GET /api/orders/:id
 * @desc Get single order by ID
 * @access Public
 */
router.get(
    '/:id',
    orderController.getOrderById
);

/**
 * @route GET /api/orders
 * @desc Get all orders (admin only)
 * @access Private (admin)
 */
router.get(
    '/',
    authMiddleware.verifyToken,
    authMiddleware.requireAdmin,
    validationMiddleware.sanitizeQuery,
    orderController.getAllOrders
);

/**
 * @route PUT /api/orders/:id/status
 * @desc Update order status (admin only)
 * @access Private (admin)
 */
router.put(
    '/:id/status',
    authMiddleware.verifyToken,
    authMiddleware.requireAdmin,
    validationMiddleware.validateOrderStatusUpdate,
    orderController.updateOrderStatus
);

module.exports = router;
