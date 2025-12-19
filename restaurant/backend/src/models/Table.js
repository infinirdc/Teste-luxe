const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Le numéro de table est requis'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'La capacité est requise'],
    min: [1, 'La capacité doit être d\'au moins 1 personne'],
    max: [20, 'La capacité ne peut pas dépasser 20 personnes']
  },
  location: {
    type: String,
    enum: ['terrasse', 'interieur', 'salon-prive', 'bar'],
    default: 'interieur'
  },
  description: {
    type: String,
    maxlength: [200, 'La description ne peut pas dépasser 200 caractères']
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance', 'cleaning'],
    default: 'available'
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Table = mongoose.model('Table', tableSchema);
module.exports = Table;