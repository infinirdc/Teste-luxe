/**
 * Product Routes
 */

const express = require('express');
const productController = require('../controllers/productController');
const validationMiddleware = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/products
 * @desc Get all products with pagination
 * @access Public
 */
router.get(
    '/',
    validationMiddleware.sanitizeQuery,
    productController.getAllProducts
);

/**
 * @route GET /api/products/:id
 * @desc Get single product by ID
 * @access Public
 */
router.get(
    '/:id',
    productController.getProductById
);

/**
 * @route POST /api/products
 * @desc Create new product (admin only)
 * @access Private (admin)
 */
router.post(
    '/',
    authMiddleware.verifyToken,
    authMiddleware.requireAdmin,
    validationMiddleware.validateProduct,
    productController.createProduct
);

/**
 * @route PUT /api/products/:id
 * @desc Update product (admin only)
 * @access Private (admin)
 */
router.put(
    '/:id',
    authMiddleware.verifyToken,
    authMiddleware.requireAdmin,
    validationMiddleware.validateProduct,
    productController.updateProduct
);

/**
 * @route DELETE /api/products/:id
 * @desc Delete product (admin only)
 * @access Private (admin)
 */
router.delete(
    '/:id',
    authMiddleware.verifyToken,
    authMiddleware.requireAdmin,
    productController.deleteProduct
);

/**
 * @route PUT /api/products/:id/stock
 * @desc Update product stock (admin only)
 * @access Private (admin)
 */
router.put(
    '/:id/stock',
    authMiddleware.verifyToken,
    authMiddleware.requireAdmin,
    productController.updateStock
);

/**
 * @route POST /api/products/seed
 * @desc Seed database with initial products (admin only)
 * @access Private (admin)
 */
router.post(
    '/seed/initial',
    authMiddleware.verifyToken,
    authMiddleware.requireAdmin,
    productController.seedProducts
);

module.exports = router;
