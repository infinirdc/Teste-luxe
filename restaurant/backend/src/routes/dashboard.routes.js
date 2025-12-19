const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Routes protégées (admin seulement)
router.get('/stats', protect, authorize('admin'), dashboardController.getDashboardStats);
router.get('/charts', protect, authorize('admin'), dashboardController.getDashboardCharts);

module.exports = router;