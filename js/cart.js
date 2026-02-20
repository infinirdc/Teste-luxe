/**
 * Shopping Cart Module
 * Handles cart operations (add, remove, update, checkout)
 */

const CartModule = (() => {
    /**
     * Add item to cart
     */
    function addToCart(product, quantity = 1) {
        if (!product || !product.id) {
            window.StateManager.addNotification('Error', 'Invalid product', 'error');
            return false;
        }

        quantity = Math.max(1, parseInt(quantity, 10));

        // Check stock
        if (product.stock <= 0) {
            window.StateManager.addNotification('Error', 'Product out of stock', 'error');
            return false;
        }

        if (quantity > product.stock) {
            window.StateManager.addNotification('Error', `Only ${product.stock} available`, 'error');
            return false;
        }

        let cart = window.StateManager.getState('cart') || [];
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                ...product,
                quantity
            });
        }

        window.StateManager.setState('cart', cart);
        updateCartTotal();
        window.StateManager.addNotification('Success', `${product.name} added to cart`, 'success');
        return true;
    }

    /**
     * Remove item from cart
     */
    function removeFromCart(productId) {
        let cart = window.StateManager.getState('cart') || [];
        cart = cart.filter(item => item.id !== productId);
        window.StateManager.setState('cart', cart);
        updateCartTotal();
        return true;
    }

    /**
     * Update item quantity
     */
    function updateQuantity(productId, quantity) {
        quantity = Math.max(1, parseInt(quantity, 10));

        let cart = window.StateManager.getState('cart') || [];
        const item = cart.find(i => i.id === productId);

        if (item) {
            if (quantity > item.stock) {
                window.StateManager.addNotification('Error', `Only ${item.stock} available`, 'error');
                return false;
            }
            item.quantity = quantity;
            window.StateManager.setState('cart', [...cart]);
            updateCartTotal();
            return true;
        }
        return false;
    }

    /**
     * Clear cart
     */
    function clearCart() {
        window.StateManager.setState('cart', []);
        window.StateManager.setState('cartTotal', 0);
    }

    /**
     * Get cart total
     */
    function getCartTotal() {
        const cart = window.StateManager.getState('cart') || [];
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    /**
     * Update cart total in state
     */
    function updateCartTotal() {
        const total = getCartTotal();
        window.StateManager.setState('cartTotal', parseFloat(total.toFixed(2)));
    }

    /**
     * Get cart items count
     */
    function getCartCount() {
        const cart = window.StateManager.getState('cart') || [];
        return cart.reduce((count, item) => count + item.quantity, 0);
    }

    /**
     * Create order from cart
     */
    async function checkout(customerName, customerPhone, notes = '') {
        try {
            const cart = window.StateManager.getState('cart') || [];

            if (cart.length === 0) {
                throw new Error('Cart is empty');
            }

            if (!window.Utils.validateName(customerName)) {
                throw new Error('Invalid customer name');
            }

            if (!window.Utils.validatePhoneNumber(customerPhone)) {
                throw new Error('Invalid phone number');
            }

            window.StateManager.setState('isLoading', true);

            const items = cart.map(item => ({
                productId: item.id,
                productName: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            const total = parseFloat(getCartTotal().toFixed(2));

            const response = await window.API.Orders.create({
                customerName,
                customerPhone,
                items,
                total,
                notes
            });

            if (response.success) {
                clearCart();
                window.StateManager.addNotification('Success', `Order ${response.data.orderId} created!`, 'success');
                return response.data;
            } else {
                throw new Error(response.message || 'Checkout failed');
            }

        } catch (error) {
            console.error('Checkout error:', error);
            window.StateManager.setState('lastError', error.message);
            window.StateManager.addNotification('Error', error.message || 'Checkout failed', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    return {
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        updateCartTotal,
        getCartCount,
        checkout
    };
})();

// Export globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartModule;
}
