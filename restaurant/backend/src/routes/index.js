// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import des routeurs
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const categoryRoutes = require('./category.routes');
const dashboardRoutes = require('./dashboard.routes');

// Montage des routeurs
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.use('/dashboard', dashboardRoutes);

// Route de santé de l'API
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Restaurant Opulence en ligne',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// Route 404
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`
  });
});

module.exports = router;