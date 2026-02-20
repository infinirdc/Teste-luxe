/**
 * Product Schema and Model
 * Stores menu items and product information
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name must not exceed 100 characters'],
        trim: true,
        index: true
    },
    type: {
        type: String,
        enum: ['repas', 'boisson', 'dessert', 'entree'],
        required: [true, 'Product type is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0.01, 'Price must be greater than 0'],
        validate: {
            validator: (v) => !isNaN(v) && v > 0,
            message: 'Price must be a valid number greater than 0'
        }
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0,
        validate: {
            validator: (v) => Number.isInteger(v),
            message: 'Stock must be an integer'
        }
    },
    stockMax: {
        type: Number,
        required: [true, 'Max stock is required'],
        min: [1, 'Max stock must be at least 1'],
        default: 50,
        validate: {
            validator: function(v) {
                return v >= this.stock;
            },
            message: 'Max stock must be greater than or equal to current stock'
        }
    },
    desc: {
        type: String,
        maxlength: [500, 'Description must not exceed 500 characters'],
        default: '',
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Image URL is required'],
        validate: {
            validator: (v) => /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v),
            message: 'Image must be a valid HTTPS URL ending with image extension'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index on type for filtering
productSchema.index({ type: 1, createdAt: -1 });

// Update updatedAt before saving
productSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Product', productSchema);
