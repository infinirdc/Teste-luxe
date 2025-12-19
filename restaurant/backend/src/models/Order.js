// src/models/Table.js
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
  qrCode: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
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

// Virtual pour la réservation actuelle
tableSchema.virtual('currentReservation', {
  ref: 'Reservation',
  localField: '_id',
  foreignField: 'table',
  justOne: true,
  match: { 
    status: 'confirmed',
    reservationTime: { $gte: new Date() }
  }
});

// Méthode pour vérifier la disponibilité
tableSchema.methods.checkAvailability = async function(dateTime) {
  const Reservation = mongoose.model('Reservation');
  
  const existingReservation = await Reservation.findOne({
    table: this._id,
    status: 'confirmed',
    reservationTime: {
      $gte: new Date(dateTime.getTime() - 2 * 60 * 60 * 1000), // 2 heures avant
      $lte: new Date(dateTime.getTime() + 2 * 60 * 60 * 1000) // 2 heures après
    }
  });
  
  return !existingReservation;
};

const Table = mongoose.model('Table', tableSchema);
module.exports = Table;