/**
 * Order Schema and Model
 * Stores customer orders and transaction information
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        validate: {
            validator: (v) => Number.isInteger(v),
            message: 'Quantity must be an integer'
        }
    },
    price: {
        type: Number,
        required: true,
        min: [0.01, 'Price must be greater than 0']
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        minlength: [2, 'Name must be at least 2 characters'],
        trim: true
    },
    customerPhone: {
        type: String,
        required: [true, 'Customer phone is required'],
        index: true,
        trim: true
    },
    items: {
        type: [orderItemSchema],
        required: [true, 'Order must contain at least one item'],
        validate: {
            validator: (v) => Array.isArray(v) && v.length > 0,
            message: 'Order must contain at least one item'
        }
    },
    total: {
        type: Number,
        required: [true, 'Order total is required'],
        min: [0.01, 'Total must be greater than 0'],
        validate: {
            validator: function(v) {
                const calculatedTotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                return Math.abs(v - calculatedTotal) < 0.01;  // Allow for floating point errors
            },
            message: 'Order total does not match sum of items'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending',
        index: true
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes must not exceed 500 characters'],
        default: '',
        trim: true
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

// Index for common queries
orderSchema.index({ customerPhone: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Update updatedAt before saving
orderSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Order', orderSchema);
