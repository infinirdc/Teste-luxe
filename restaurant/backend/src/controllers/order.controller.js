// src/controllers/order.controller.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const Table = require('../models/Table');

// Créer une commande
exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, notes, paymentMethod } = req.body;
    const userId = req.user.id;

    // Vérifier la table
    const table = await Table.findById(tableId);
    if (!table || table.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: 'Table non disponible'
      });
    }

    // Vérifier et préparer les items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Produit ${item.productId} non disponible`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        notes: item.notes
      });

      // Réserver le stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculer les taxes (exemple: 10%)
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    // Créer la commande
    const order = await Order.create({
      user: userId,
      table: tableId,
      items: orderItems,
      subtotal,
      tax,
      total,
      notes,
      paymentMethod,
      status: 'pending'
    });

    // Mettre à jour le statut de la table
    table.status = 'occupied';
    table.currentOrder = order._id;
    await table.save();

    // Mettre à jour les compteurs de vente des produits
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { salesCount: item.quantity }
      });
    }

    res.status(201).json({
      success: true,
      order,
      message: 'Commande créée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message
    });
  }
};

// Récupérer les commandes
exports.getOrders = async (req, res) => {
  try {
    const { 
      status, 
      startDate, 
      endDate, 
      tableId,
      page = 1,
      limit = 20 
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (tableId) filter.table = tableId;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Si l'utilisateur n'est pas admin, voir seulement ses commandes
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'user', select: 'username email' },
        { path: 'table', select: 'number name' }
      ]
    };

    const orders = await Order.paginate(filter, options);

    res.status(200).json({
      success: true,
      count: orders.totalDocs,
      totalPages: orders.totalPages,
      currentPage: orders.page,
      orders: orders.docs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes',
      error: error.message
    });
  }
};

// Mettre à jour le statut d'une commande
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'client' && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette commande'
      });
    }

    // Mettre à jour le statut
    await order.updateStatus(status, req.user.id);

    // Si la commande est complétée, libérer la table
    if (status === 'completed') {
      await Table.findByIdAndUpdate(order.table, {
        status: 'available',
        currentOrder: null
      });
    }

    res.status(200).json({
      success: true,
      order,
      message: `Statut de la commande mis à jour: ${status}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
};

// Annuler une commande
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier si la commande peut être annulée
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'La commande ne peut plus être annulée'
      });
    }

    // Restituer le stock des produits
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // Mettre à jour le statut
    order.status = 'cancelled';
    order.paymentStatus = 'refunded';
    await order.save();

    // Libérer la table
    await Table.findByIdAndUpdate(order.table, {
      status: 'available',
      currentOrder: null
    });

    res.status(200).json({
      success: true,
      message: 'Commande annulée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la commande',
      error: error.message
    });
  }
};

// Récupérer les statistiques des commandes
exports.getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Statistiques du jour
    const todayStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Commandes par statut
    const statusStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);

    // Top produits
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthAgo },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        today: todayStats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
        byStatus: statusStats,
        topProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};