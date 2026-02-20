/**
 * Products Module
 * Handles product loading, filtering, and searching
 */

const ProductsModule = (() => {
    /**
     * Load all products
     */
    async function loadProducts(page = 1, limit = 20) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Products.getAll(page, limit);

            if (response.success) {
                window.StateManager.setState('menuData', response.data.products);
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load products');
            }

        } catch (error) {
            console.error('Load products error:', error);
            window.StateManager.addNotification('Error', 'Failed to load products', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Get single product
     */
    async function getProduct(id) {
        try {
            const response = await window.API.Products.getById(id);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Product not found');
            }

        } catch (error) {
            console.error('Get product error:', error);
            throw error;
        }
    }

    /**
     * Search products
     */
    function searchProducts(query) {
        window.StateManager.setState('searchQuery', query);
        return getFilteredProducts();
    }

    /**
     * Filter by category
     */
    function filterByCategory(category) {
        window.StateManager.setState('currentCategory', category);
        return getFilteredProducts();
    }

    /**
     * Get filtered products based on current state
     */
    function getFilteredProducts() {
        const products = window.StateManager.getState('menuData') || [];
        const category = window.StateManager.getState('currentCategory');
        const query = window.StateManager.getState('searchQuery').toLowerCase();

        return products.filter(p => {
            const matchCategory = category === 'all' || p.type === category;
            const matchSearch = p.name.toLowerCase().includes(query) ||
                              (p.desc && p.desc.toLowerCase().includes(query));
            return matchCategory && matchSearch;
        });
    }

    /**
     * Create product (admin only)
     */
    async function createProduct(productData) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Products.create(productData);

            if (response.success) {
                window.StateManager.addNotification('Success', 'Product created', 'success');
                await loadProducts();  // Reload products
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
     * Update product (admin only)
     */
    async function updateProduct(id, productData) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Products.update(id, productData);

            if (response.success) {
                window.StateManager.addNotification('Success', 'Product updated', 'success');
                await loadProducts();  // Reload products
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
     * Delete product (admin only)
     */
    async function deleteProduct(id) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Products.delete(id);

            if (response.success) {
                window.StateManager.addNotification('Success', 'Product deleted', 'success');
                await loadProducts();  // Reload products
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
     * Update stock (admin only)
     */
    async function updateStock(id, stock) {
        try {
            const response = await window.API.Products.updateStock(id, stock);

            if (response.success) {
                window.StateManager.addNotification('Success', 'Stock updated', 'success');
                await loadProducts();
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
        loadProducts,
        getProduct,
        searchProducts,
        filterByCategory,
        getFilteredProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        updateStock
    };
})();

// Debounced search
const debouncedSearch = window.Utils.debounce(
    (query) => ProductsModule.searchProducts(query),
    window.APP_CONFIG?.DEBOUNCE_SEARCH_MS || 300
);

// Export globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsModule;
}
