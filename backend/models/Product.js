const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['repas', 'boisson', 'dessert', 'entree']
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    maxStock: {
        type: Number,
        default: 100
    },
    description: String,
    image: String
});

module.exports = mongoose.model('Product', ProductSchema);
