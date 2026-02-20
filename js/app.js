/**
 * Application Initialization
 * Main app initialization and event handlers
 */

const AppModule = (() => {
    /**
     * Initialize application
     */
    async function init() {
        console.log('🚀 Initializing Opulence Restaurant App...');

        try {
            // Initialize UI
            UIModule.init();

            // Try to restore session
            const sessionRestored = AuthModule.restoreSession();
            if (sessionRestored) {
                console.log('✓ Session restored');
                UIModule.navigate('home');
            } else {
                console.log('No session found, showing auth screen');
                UIModule.navigate('auth');
            }

            // Load products
            await ProductsModule.loadProducts();
            console.log('✓ Products loaded');

            // Setup event listeners
            setupEventListeners();

            // Setup form handlers
            setupFormHandlers();

            console.log('✓ Opulence Restaurant App initialized successfully');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            UIModule.showToast('Error', 'Failed to initialize app', 'error');
        }
    }

    /**
     * Setup global event listeners
     */
    function setupEventListeners() {
        // Cart icon click
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-toggle-sidebar]')) {
                UIModule.toggleSidebar();
            }
            if (e.target.closest('[data-nav-btn]')) {
                const tab = e.target.closest('[data-nav-btn]').dataset.tab;
                UIModule.navigate(tab);
            }
            if (e.target.closest('[data-logout]')) {
                AuthModule.logout();
                UIModule.navigate('auth');
            }
        });

        // Search input with debounce
        const searchInput = document.querySelector('[data-search-input]');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Category filter
        document.addEventListener('change', (e) => {
            if (e.target.dataset.categoryFilter) {
                ProductsModule.filterByCategory(e.target.value);
            }
        });

        // Close popup on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-popup-overlay]')) {
                UIModule.hideModal();
            }
        });
    }

    /**
     * Setup form handlers
     */
    function setupFormHandlers() {
        // Registration form
        const registerForm = document.querySelector('[data-form="register"]');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = registerForm.querySelector('[data-field="name"]').value;
                const phone = registerForm.querySelector('[data-field="phone"]').value;

                try {
                    await AuthModule.register(name, phone);
                    registerForm.reset();
                    UIModule.navigate('home');
                } catch (error) {
                    // Error already handled in auth module
                }
            });
        }

        // Login form
        const loginForm = document.querySelector('[data-form="login"]');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const phone = loginForm.querySelector('[data-field="phone"]').value;

                try {
                    await AuthModule.login(phone);
                    loginForm.reset();
                    UIModule.navigate('home');
                } catch (error) {
                    // Error already handled in auth module
                }
            });
        }

        // Admin login form
        const adminForm = document.querySelector('[data-form="admin-login"]');
        if (adminForm) {
            adminForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = adminForm.querySelector('[data-field="username"]').value;
                const password = adminForm.querySelector('[data-field="password"]').value;

                try {
                    await AuthModule.adminLogin(username, password);
                    adminForm.reset();
                    UIModule.navigate('admin-dash');
                } catch (error) {
                    // Error already handled in auth module
                }
            });
        }

        // Checkout form
        const checkoutForm = document.querySelector('[data-form="checkout"]');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const customerName = checkoutForm.querySelector('[data-field="customer-name"]').value;
                const customerPhone = checkoutForm.querySelector('[data-field="customer-phone"]').value;
                const notes = checkoutForm.querySelector('[data-field="notes"]')?.value || '';

                try {
                    const order = await CartModule.checkout(customerName, customerPhone, notes);
                    checkoutForm.reset();
                    UIModule.navigate('visitor-orders');
                    // Load user orders
                    await OrdersModule.getUserOrders(customerPhone);
                } catch (error) {
                    // Error already handled in module
                }
            });
        }

        // Product admin form
        const productForm = document.querySelector('[data-form="product"]');
        if (productForm) {
            productForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const id = productForm.querySelector('[data-field="id"]')?.value;
                const productData = {
                    name: productForm.querySelector('[data-field="name"]').value,
                    type: productForm.querySelector('[data-field="type"]').value,
                    price: parseFloat(productForm.querySelector('[data-field="price"]').value),
                    stock: parseInt(productForm.querySelector('[data-field="stock"]').value, 10),
                    stockMax: parseInt(productForm.querySelector('[data-field="stock-max"]').value, 10),
                    desc: productForm.querySelector('[data-field="desc"]').value,
                    image: productForm.querySelector('[data-field="image"]').value
                };

                try {
                    if (id) {
                        await AdminModule.updateProduct(id, productData);
                    } else {
                        await AdminModule.createProduct(productData);
                    }
                    productForm.reset();
                    UIModule.navigate('admin-menu');
                } catch (error) {
                    // Error already handled in module
                }
            });
        }
    }

    /**
     * Start application
     */
    return {
        init
    };
})();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AppModule.init);
} else {
    AppModule.init();
}

// Export globally
window.AppModule = AppModule;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppModule;
}
