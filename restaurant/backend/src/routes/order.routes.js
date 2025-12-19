// src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Routes protégées
router.post('/', protect, orderController.createOrder);
router.get('/', protect, orderController.getOrders);
router.get('/stats', protect, authorize('admin', 'chef'), orderController.getOrderStats);
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/status', protect, orderController.updateOrderStatus);
router.delete('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;