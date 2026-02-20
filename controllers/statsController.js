/**
 * Statistics Controller
 * Handles dashboard and analytics endpoints
 */

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get dashboard statistics (admin only)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    logger.debug('Fetching dashboard statistics');

    const [
        totalProducts,
        lowStockProducts,
        totalUsers,
        totalOrders,
        pendingOrders,
        readyOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        thisMonthRevenue,
        thisWeekRevenue,
        todayRevenue,
        topProducts,
        recentOrders
    ] = await Promise.all([
        // Products
        Product.countDocuments(),
        Product.countDocuments({ $expr: { $lt: ['$stock', { $mul: [0.1, '$stockMax'] }] } }),

        // Users
        User.countDocuments(),

        // Orders overview
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'ready' }),
        Order.countDocuments({ status: 'delivered' }),
        Order.countDocuments({ status: 'cancelled' }),

        // Revenue
        Order.aggregate([
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setDate(1))
                    }
                }
            },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]),

        // Top products
        Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.productId', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]),

        // Recent orders
        Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
    ]);

    const stats = {
        overview: {
            totalProducts,
            lowStockProducts,
            totalUsers,
            totalOrders: totalOrders
        },
        orders: {
            pending: pendingOrders,
            ready: readyOrders,
            delivered: deliveredOrders,
            cancelled: cancelledOrders
        },
        revenue: {
            total: totalRevenue[0]?.total || 0,
            thisMonth: thisMonthRevenue[0]?.total || 0,
            thisWeek: thisWeekRevenue[0]?.total || 0,
            today: todayRevenue[0]?.total || 0
        },
        topProducts: topProducts.map(p => ({
            productId: p._id,
            totalSold: p.totalSold,
            revenue: p.revenue
        })),
        recentOrders
    };

    res.set('Cache-Control', 'public, max-age=60');  // Cache for 1 minute

    logger.debug('Dashboard statistics retrieved');

    sendSuccess(res, 200, 'Dashboard statistics retrieved', stats);
});

/**
 * Get product analytics (admin only)
 */
const getProductAnalytics = asyncHandler(async (req, res) => {
    logger.debug('Fetching product analytics');

    const [
        byType,
        byStock,
        averagePrice,
        totalValue
    ] = await Promise.all([
        // Products by type
        Product.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    avgStock: { $avg: '$stock' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]),

        // Products by stock level
        Product.aggregate([
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$stock', 0] },
                            'Out of stock',
                            {
                                $cond: [
                                    { $lt: ['$stock', { $multiply: [0.2, '$stockMax'] }] },
                                    'Low stock',
                                    {
                                        $cond: [
                                            { $lt: ['$stock', { $multiply: [0.8, '$stockMax'] }] },
                                            'Medium stock',
                                            'Well stocked'
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    count: { $sum: 1 }
                }
            }
        ]),

        // Average price
        Product.aggregate([
            {
                $group: {
                    _id: null,
                    average: { $avg: '$price' },
                    min: { $min: '$price' },
                    max: { $max: '$price' }
                }
            }
        ]),

        // Total inventory value
        Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: { $multiply: ['$stock', '$price'] } }
                }
            }
        ])
    ]);

    const analytics = {
        byType,
        byStock,
        pricing: averagePrice[0] || { average: 0, min: 0, max: 0 },
        inventoryValue: totalValue[0]?.totalValue || 0
    };

    res.set('Cache-Control', 'public, max-age=300');  // Cache for 5 minutes

    logger.debug('Product analytics retrieved');

    sendSuccess(res, 200, 'Product analytics retrieved', analytics);
});

/**
 * Get order trends (admin only)
 */
const getOrderTrends = asyncHandler(async (req, res) => {
    logger.debug('Fetching order trends');

    const trends = await Order.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                orderCount: { $sum: 1 },
                totalRevenue: { $sum: '$total' },
                avgOrderValue: { $avg: '$total' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }  // Last 12 months
    ]);

    res.set('Cache-Control', 'public, max-age=600');  // Cache for 10 minutes

    logger.debug('Order trends retrieved');

    sendSuccess(res, 200, 'Order trends retrieved', trends);
});

module.exports = {
    getDashboardStats,
    getProductAnalytics,
    getOrderTrends
};
