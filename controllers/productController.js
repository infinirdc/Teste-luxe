/**
 * Product Controller
 * Handles all product-related operations
 */

const Product = require('../models/Product');
const { sendSuccess, sendError, sendNotFound, sendValidationError } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all products with pagination
 */
const getAllProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    logger.debug('Fetching products', { page: pageNum, limit: limitNum });

    const [products, total] = await Promise.all([
        Product.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Product.countDocuments()
    ]);

    res.set('Cache-Control', 'public, max-age=300');  // Cache for 5 minutes

    sendSuccess(res, 200, 'Products retrieved successfully', {
        products,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
});

/**
 * Get single product by ID
 */
const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.debug('Fetching product', { productId: id });

    const product = await Product.findById(id).lean();

    if (!product) {
        logger.warn('Product not found', { productId: id });
        return sendNotFound(res, 'Product not found');
    }

    res.set('Cache-Control', 'public, max-age=300');

    sendSuccess(res, 200, 'Product retrieved successfully', product);
});

/**
 * Create new product (admin only)
 */
const createProduct = asyncHandler(async (req, res) => {
    const { name, type, price, stock, stockMax, desc, image } = req.body;

    logger.info('Creating product', { name, type, createdBy: req.user?.userId });

    const product = new Product({
        name,
        type,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        stockMax: parseInt(stockMax, 10),
        desc,
        image
    });

    await product.save();
    logger.info('Product created', { productId: product._id });

    sendSuccess(res, 201, 'Product created successfully', product);
});

/**
 * Update product (admin only)
 */
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    logger.info('Updating product', { productId: id, updatedBy: req.user?.userId });

    // Remove sensitive fields
    delete updates._id;
    delete updates.createdAt;

    const product = await Product.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    );

    if (!product) {
        logger.warn('Product not found for update', { productId: id });
        return sendNotFound(res, 'Product not found');
    }

    logger.info('Product updated', { productId: id });

    sendSuccess(res, 200, 'Product updated successfully', product);
});

/**
 * Delete product (admin only)
 */
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Deleting product', { productId: id, deletedBy: req.user?.userId });

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        logger.warn('Product not found for deletion', { productId: id });
        return sendNotFound(res, 'Product not found');
    }

    logger.info('Product deleted', { productId: id });

    sendSuccess(res, 200, 'Product deleted successfully', { id: product._id });
});

/**
 * Update product stock (admin only)
 */
const updateStock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;

    logger.info('Updating stock', { productId: id, newStock: stock });

    if (!Number.isInteger(parseInt(stock, 10)) || stock < 0) {
        return sendValidationError(res, 'Stock must be a non-negative integer');
    }

    const product = await Product.findByIdAndUpdate(
        id,
        { stock: parseInt(stock, 10) },
        { new: true, runValidators: true }
    );

    if (!product) {
        logger.warn('Product not found for stock update', { productId: id });
        return sendNotFound(res, 'Product not found');
    }

    logger.info('Stock updated', { productId: id, newStock: stock });

    sendSuccess(res, 200, 'Stock updated successfully', product);
});

/**
 * Seed database with initial products
 */
const seedProducts = asyncHandler(async (req, res) => {
    logger.warn('Seeding database', { requestedBy: req.user?.userId });

    // Check if products already exist
    const count = await Product.countDocuments();
    if (count > 0) {
        return sendError(res, 400, 'Database already contains products');
    }

    const products = [
        { name: 'Moambe', type: 'repas', price: 5.99, stock: 50, stockMax: 100, desc: 'Traditional congolese dish', image: 'https://via.placeholder.com/300?text=Moambe' },
        { name: 'Liboke', type: 'repas', price: 4.99, stock: 50, stockMax: 100, desc: 'Fish wrapped in banana leaves', image: 'https://via.placeholder.com/300?text=Liboke' },
        { name: 'Cassava bread', type: 'entree', price: 2.99, stock: 100, stockMax: 200, desc: 'Crispy cassava', image: 'https://via.placeholder.com/300?text=CassavaBread' },
        { name: 'Fresh juice', type: 'boisson', price: 1.99, stock: 100, stockMax: 200, desc: 'Natural fresh juice', image: 'https://via.placeholder.com/300?text=FreshJuice' },
        { name: 'Fruit salad', type: 'dessert', price: 3.99, stock: 50, stockMax: 100, desc: 'Mix of tropical fruits', image: 'https://via.placeholder.com/300?text=FruitSalad' }
    ];

    await Product.insertMany(products);
    logger.info('Products seeded successfully', { count: products.length });

    sendSuccess(res, 201, 'Database seeded with initial products', { count: products.length });
});

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    seedProducts
};
