// src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif'],
    max: [10000, 'Le prix ne peut pas dépasser 10000']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  type: {
    type: String,
    enum: ['repas', 'boisson', 'dessert', 'entree'],
    required: true
  },
  image: {
    type: String,
    default: '/uploads/products/default.jpg'
  },
  images: [{
    type: String
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  stockMax: {
    type: Number,
    required: true,
    min: 1,
    default: 50
  },
  minStockAlert: {
    type: Number,
    default: 10
  },
  costPrice: {
    type: Number,
    min: 0
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: 1,
    max: 120
  },
  ingredients: [{
    name: String,
    quantity: String,
    unit: String
  }],
  allergens: [String],
  nutritionalInfo: {
    calories: Number,
    proteins: Number,
    carbohydrates: Number,
    fats: Number
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  salesCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratingsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware pour générer le slug avant sauvegarde
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Virtual pour calculer le pourcentage de stock
productSchema.virtual('stockPercentage').get(function() {
  return (this.stock / this.stockMax) * 100;
});

// Virtual pour déterminer le statut du stock
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out-of-stock';
  if (this.stock <= this.minStockAlert) return 'low';
  if (this.stockPercentage >= 80) return 'high';
  return 'normal';
});

// Méthode pour augmenter le compteur de ventes
productSchema.methods.incrementSales = async function(quantity = 1) {
  this.salesCount += quantity;
  await this.save();
};

// Index pour les recherches
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, type: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;