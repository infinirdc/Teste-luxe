// src/routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadSingle, handleUploadError } = require('../middleware/upload.middleware');

// Routes publiques
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/stock/low', productController.getLowStockProducts);

// Routes protégées (admin seulement)
router.post(
  '/',
  protect,
  authorize('admin', 'chef'),
  uploadSingle('image'),
  handleUploadError,
  productController.createProduct
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'chef'),
  uploadSingle('image'),
  handleUploadError,
  productController.updateProduct
);

router.put(
  '/:id/stock',
  protect,
  authorize('admin', 'chef'),
  productController.updateStock
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  productController.deleteProduct
);

module.exports = router;