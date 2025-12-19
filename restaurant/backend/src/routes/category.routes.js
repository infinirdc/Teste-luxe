const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadSingle, handleUploadError } = require('../middleware/upload.middleware');

// Routes publiques
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Routes protégées (admin seulement)
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadSingle('image'),
  handleUploadError,
  categoryController.createCategory
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadSingle('image'),
  handleUploadError,
  categoryController.updateCategory
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  categoryController.deleteCategory
);

module.exports = router;