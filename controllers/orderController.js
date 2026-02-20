/**
 * Order Controller
 * Handles all order-related operations
 */

const Order = require('../models/Order');
const { sendSuccess, sendError, sendNotFound, sendValidationError } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Generate unique order ID
 */
function generateOrderId() {
    return `#OP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Create new order
 */
const createOrder = asyncHandler(async (req, res) => {
    const { customerName, customerPhone, items, total, notes } = req.body;

    logger.info('Creating order', { phone: customerPhone, itemsCount: items.length });

    // Generate unique order ID
    let orderId = generateOrderId();
    let existingOrder = await Order.findOne({ orderId });
    while (existingOrder) {
        orderId = generateOrderId();
        existingOrder = await Order.findOne({ orderId });
    }

    // Create order
    const order = new Order({
        orderId,
        customerName,
        customerPhone,
        items,
        total: parseFloat(total),
        notes: notes || '',
        status: 'pending'
    });

    await order.save();
    logger.info('Order created', { orderId, phone: customerPhone, total });

    sendSuccess(res, 201, 'Order created successfully', order);
});

/**
 * Get orders for a customer
 */
const getCustomerOrders = asyncHandler(async (req, res) => {
    const { phone } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    logger.debug('Fetching customer orders', { phone });

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { customerPhone: phone };
    if (status) {
        query.status = status;
    }

    const [orders, total] = await Promise.all([
        Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Order.countDocuments(query)
    ]);

    sendSuccess(res, 200, 'Customer orders retrieved', {
        orders,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
});

/**
 * Get single order by ID
 */
const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.debug('Fetching order', { orderId: id });

    const order = await Order.findById(id).lean();

    if (!order) {
        logger.warn('Order not found', { orderId: id });
        return sendNotFound(res, 'Order not found');
    }

    sendSuccess(res, 200, 'Order retrieved', order);
});

/**
 * Get all orders (admin only)
 */
const getAllOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = -1 } = req.query;

    logger.debug('Fetching all orders', { status, page });

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const order = parseInt(sortOrder, 10) === 1 ? 1 : -1;

    // Build query
    const query = {};
    if (status) {
        query.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = order;

    const [orders, total] = await Promise.all([
        Order.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Order.countDocuments(query)
    ]);

    sendSuccess(res, 200, 'All orders retrieved', {
        orders,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
});

/**
 * Update order status (admin only)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    logger.info('Updating order status', { orderId: id, newStatus: status, updatedBy: req.user?.userId });

    const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    );

    if (!order) {
        logger.warn('Order not found for status update', { orderId: id });
        return sendNotFound(res, 'Order not found');
    }

    logger.info('Order status updated', { orderId: id, newStatus: status });

    sendSuccess(res, 200, 'Order status updated', order);
});

/**
 * Get order statistics (admin only)
 */
const getOrderStats = asyncHandler(async (req, res) => {
    logger.debug('Fetching order statistics');

    const [
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
        revenueThisMonth
    ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } }),
        Order.countDocuments({ status: 'delivered' }),
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
            {
                $group: { _id: null, total: { $sum: '$total' } }
            }
        ])
    ]);

    const stats = {
        totalOrders,
        activeOrders: pendingOrders,
        deliveredOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        averageOrderValue: totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0
    };

    logger.debug('Order statistics retrieved', stats);

    sendSuccess(res, 200, 'Order statistics retrieved', stats);
});

module.exports = {
    createOrder,
    getCustomerOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    getOrderStats
};
