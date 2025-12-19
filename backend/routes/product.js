const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products
// @access  Public (or Protected)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Protected
router.post('/', protect, async (req, res) => {
    const { name, category, price, stock, maxStock, description, image } = req.body;

    try {
        const product = new Product({
            name,
            category,
            price,
            stock,
            maxStock,
            description,
            image
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Protected
router.put('/:id', protect, async (req, res) => {
    const { name, category, price, stock, maxStock, description, image } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.category = category || product.category;
            product.price = price || product.price;
            product.stock = stock !== undefined ? stock : product.stock;
            product.maxStock = maxStock || product.maxStock;
            product.description = description || product.description;
            product.image = image || product.image;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/products/:id/stock
// @desc    Update product stock
// @access  Protected
router.put('/:id/stock', protect, async (req, res) => {
    const { stock } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.stock = stock;
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Protected
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
