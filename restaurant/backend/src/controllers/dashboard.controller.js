const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Récupérer les statistiques du dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Commandes du jour
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      status: { $ne: 'cancelled' }
    });

    // Revenus du jour
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    // Commandes d'hier
    const yesterdayOrders = await Order.find({
      createdAt: { $gte: yesterday, $lt: today },
      status: { $ne: 'cancelled' }
    });

    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0);

    // Variation des revenus
    const revenueChange = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0;

    // Commandes de la semaine
    const weeklyOrders = await Order.find({
      createdAt: { $gte: weekAgo },
      status: { $ne: 'cancelled' }
    });

    // Commandes du mois
    const monthlyOrders = await Order.find({
      createdAt: { $gte: monthAgo },
      status: { $ne: 'cancelled' }
    });

    // Produits en rupture de stock
    const lowStockProducts = await Product.find({
      stock: { $lte: '$minStockAlert' },
      isActive: true
    }).limit(5);

    // Commandes en attente
    const pendingOrders = await Order.find({
      status: { $in: ['pending', 'confirmed', 'preparing'] }
    }).sort({ createdAt: -1 }).limit(5);

    // Meilleurs produits
    const topProducts = await Product.find({ isActive: true })
      .sort({ salesCount: -1 })
      .limit(5)
      .select('name image salesCount price');

    // Statistiques résumées
    const stats = {
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue,
        avgOrderValue: todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0
      },
      weekly: {
        orders: weeklyOrders.length,
        revenue: weeklyOrders.reduce((sum, order) => sum + order.total, 0)
      },
      monthly: {
        orders: monthlyOrders.length,
        revenue: monthlyOrders.reduce((sum, order) => sum + order.total, 0)
      },
      revenueChange: parseFloat(revenueChange.toFixed(2)),
      lowStockCount: lowStockProducts.length,
      pendingOrdersCount: pendingOrders.length,
      topProducts,
      pendingOrders,
      lowStockProducts
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Récupérer les graphiques de données
exports.getDashboardCharts = async (req, res) => {
  try {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Données pour le graphique des revenus par jour
    const revenueByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 30 }
    ]);

    // Données pour le graphique des catégories
    const revenueByCategory = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthAgo },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails.name",
          revenue: { $sum: "$items.total" },
          count: { $sum: "$items.quantity" },
          color: { $first: "$categoryDetails.color" }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Données pour le graphique des heures de pointe
    const ordersByHour = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const charts = {
      revenueByDay,
      revenueByCategory,
      ordersByHour
    };

    res.status(200).json({
      success: true,
      charts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des graphiques',
      error: error.message
    });
  }
};