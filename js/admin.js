/**
 * Admin Module
 * Handles admin-specific operations (statistics, analytics, management)
 */

const AdminModule = (() => {
    /**
     * Get dashboard statistics
     */
    async function getDashboardStats() {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Stats.getDashboard();

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load statistics');
            }

        } catch (error) {
            console.error('Get stats error:', error);
            window.StateManager.addNotification('Error', 'Failed to load statistics', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Get product analytics
     */
    async function getProductAnalytics() {
        try {
            const response = await window.API.Stats.getProducts();

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load analytics');
            }

        } catch (error) {
            console.error('Get product analytics error:', error);
            window.StateManager.addNotification('Error', 'Failed to load analytics', 'error');
            throw error;
        }
    }

    /**
     * Get order trends
     */
    async function getOrderTrends() {
        try {
            const response = await window.API.Stats.getTrends();

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load trends');
            }

        } catch (error) {
            console.error('Get order trends error:', error);
            throw error;
        }
    }

    /**
     * Get all orders with filtering
     */
    async function getOrders(page = 1, status = null) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Orders.getAll(page, 20, status);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load orders');
            }

        } catch (error) {
            console.error('Get orders error:', error);
            window.StateManager.addNotification('Error', 'Failed to load orders', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Update order status
     */
    async function updateOrderStatus(orderId, status) {
        try {
            const response = await window.API.Orders.updateStatus(orderId, status);

            if (response.success) {
                window.StateManager.addNotification('Success', 'Order status updated', 'success');
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to update order');
            }

        } catch (error) {
            console.error('Update order error:', error);
            window.StateManager.addNotification('Error', error.message || 'Failed to update order', 'error');
            throw error;
        }
    }

    /**
     * Get all products
     */
    async function getProducts(page = 1) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Products.getAll(page, 100);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load products');
            }

        } catch (error) {
            console.error('Get products error:', error);
            window.StateManager.addNotification('Error', 'Failed to load products', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Create product
     */
    async function createProduct(productData) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Products.create(productData);

            if (response.success) {
                window.StateManager.addNotification('Success', 'Product created', 'success');
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to create product');
            }

        } catch (error) {
            console.error('Create product error:', error);
            window.StateManager.addNotification('Error', error.message || 'Failed to create product', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Update product
     */
    async function updateProduct(id, productData) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Products.update(id, productData);

            if (response.success) {
                window.StateManager.addNotification('Success', 'Product updated', 'success');
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to update product');
            }

        } catch (error) {
            console.error('Update product error:', error);
            window.StateManager.addNotification('Error', error.message || 'Failed to update product', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Delete product
     */
    async function deleteProduct(id) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Products.delete(id);

            if (response.success) {
                window.StateManager.addNotification('Success', 'Product deleted', 'success');
                return true;
            } else {
                throw new Error(response.message || 'Failed to delete product');
            }

        } catch (error) {
            console.error('Delete product error:', error);
            window.StateManager.addNotification('Error', error.message || 'Failed to delete product', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Update product stock
     */
    async function updateProductStock(id, stock) {
        try {
            const response = await window.API.Products.updateStock(id, stock);

            if (response.success) {
                window.StateManager.addNotification('Success', 'Stock updated', 'success');
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to update stock');
            }

        } catch (error) {
            console.error('Update stock error:', error);
            window.StateManager.addNotification('Error', error.message || 'Failed to update stock', 'error');
            throw error;
        }
    }

    return {
        getDashboardStats,
        getProductAnalytics,
        getOrderTrends,
        getOrders,
        updateOrderStatus,
        getProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        updateProductStock
    };
})();

// Export globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminModule;
}
