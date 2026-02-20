/**
 * Orders Module
 * Handles order operations for visitors and admin
 */

const OrdersModule = (() => {
    /**
     * Get orders for current user
     */
    async function getUserOrders(phone, status = null) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Orders.getCustomerOrders(phone, status, 1);

            if (response.success) {
                window.StateManager.setState('userOrders', response.data.orders);
                return response.data.orders;
            } else {
                throw new Error(response.message || 'Failed to load orders');
            }

        } catch (error) {
            console.error('Get user orders error:', error);
            window.StateManager.addNotification('Error', 'Failed to load orders', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Get single order
     */
    async function getOrder(id) {
        try {
            const response = await window.API.Orders.getById(id);

            if (response.success) {
                window.StateManager.setState('selectedOrder', response.data);
                return response.data;
            } else {
                throw new Error(response.message || 'Order not found');
            }

        } catch (error) {
            console.error('Get order error:', error);
            throw error;
        }
    }

    /**
     * Get all orders (admin only)
     */
    async function getAllOrders(page = 1, limit = 20, status = null) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Orders.getAll(page, limit, status);

            if (response.success) {
                window.StateManager.setState('allOrders', response.data.orders);
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load orders');
            }

        } catch (error) {
            console.error('Get all orders error:', error);
            window.StateManager.addNotification('Error', 'Failed to load orders', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Update order status (admin only)
     */
    async function updateStatus(id, status) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Orders.updateStatus(id, status);

            if (response.success) {
                window.StateManager.addNotification('Success', `Order status updated to ${status}`, 'success');
                // Reload orders
                const user = window.StateManager.getState('currentUser');
                if (user?.role === 'admin') {
                    await getAllOrders();
                } else {
                    await getUserOrders(user?.phone);
                }
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to update order status');
            }

        } catch (error) {
            console.error('Update order status error:', error);
            window.StateManager.addNotification('Error', error.message || 'Failed to update order status', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Track order by ID
     */
    async function trackOrder(orderId) {
        try {
            // Try to parse as MongoDB ID or Order ID
            const response = await window.API.Orders.getById(orderId);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Order not found');
            }

        } catch (error) {
            console.error('Track order error:', error);
            throw error;
        }
    }

    /**
     * Reorder from existing order
     */
    async function reorder(orderId) {
        try {
            const order = await getOrder(orderId);

            if (!order) {
                throw new Error('Order not found');
            }

            // Create new order with same items
            const cart = order.items.map(item => ({
                id: item.productId,
                name: item.productName,
                price: item.price,
                quantity: item.quantity
            }));

            window.StateManager.setState('cart', cart);
            window.StateManager.addNotification('Success', 'Order items added to cart', 'success');
            return cart;

        } catch (error) {
            console.error('Reorder error:', error);
            window.StateManager.addNotification('Error', 'Failed to reorder', 'error');
            throw error;
        }
    }

    return {
        getUserOrders,
        getOrder,
        getAllOrders,
        updateStatus,
        trackOrder,
        reorder
    };
})();

// Export globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrdersModule;
}
