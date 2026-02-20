/**
 * UI Module
 * Handles all UI rendering and DOM manipulation
 */

const UIModule = (() => {
    /**
     * Show notification toast
     */
    function showToast(title, message, type = 'info') {
        const toastContainer = document.getElementById('toast-container') || createToastContainer();

        const toast = document.createElement('div');
        const bgColor = {
            'success': 'bg-green-500',
            'error': 'bg-red-500',
            'info': 'bg-blue-500',
            'warning': 'bg-yellow-500'
        }[type] || 'bg-blue-500';

        toast.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-lg mb-3 animate-slide-up`;
        toast.innerHTML = `
            <div class="font-bold">${window.Utils.escapeHtml(title)}</div>
            <div class="text-sm">${window.Utils.escapeHtml(message)}</div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, window.APP_CONFIG?.TOAST_DURATION_MS || 3000);
    }

    /**
     * Create toast container if not exists
     */
    function createToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-4 right-4 z-50';
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Navigate to section
     */
    function navigate(tab) {
        const previousTab = window.StateManager.getState('currentTab');
        window.StateManager.setState('previousTab', previousTab);
        window.StateManager.setState('currentTab', tab);

        // Hide all sections
        document.querySelectorAll('[data-section]').forEach(el => {
            el.classList.add('hidden');
        });

        // Show selected section
        const section = document.querySelector(`[data-section="${tab}"]`);
        if (section) {
            section.classList.remove('hidden');
        }

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-rose-600/20', 'border-rose-600');
            btn.classList.add('border-transparent', 'text-zinc-400', 'hover:text-white');
        });

        const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'bg-rose-600/20', 'border-rose-600');
            activeBtn.classList.remove('border-transparent', 'text-zinc-400');
        }

        // Close sidebar on mobile after navigation
        if (window.Utils.isMobileSize()) {
            closeSidebar();
        }
    }

    /**
     * Toggle sidebar
     */
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('mobile-sidebar-hidden');
            sidebar.classList.toggle('mobile-sidebar-show');
        }
    }

    /**
     * Close sidebar
     */
    function closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.Utils.isMobileSize()) {
            sidebar.classList.add('mobile-sidebar-hidden');
            sidebar.classList.remove('mobile-sidebar-show');
        }
    }

    /**
     * Show modal/popup
     */
    function showModal(title, content, onConfirm = null, onCancel = null) {
        window.StateManager.setState('popupTitle', title);
        window.StateManager.setState('popupContent', content);
        window.StateManager.setState('popupCallback', onConfirm);
        window.StateManager.setState('isPopupOpen', true);

        const popup = document.getElementById('popup');
        if (popup) {
            popup.classList.remove('hidden');
        }
    }

    /**
     * Hide modal/popup
     */
    function hideModal() {
        window.StateManager.setState('isPopupOpen', false);
        const popup = document.getElementById('popup');
        if (popup) {
            popup.classList.add('hidden');
        }
    }

    /**
     * Update cart UI
     */
    function updateCartUI() {
        const count = CartModule.getCartCount();
        const total = CartModule.getCartTotal();

        // Update cart count badge
        const cartBadge = document.querySelector('[data-cart-count]');
        if (cartBadge) {
            cartBadge.textContent = count;
            cartBadge.classList.toggle('hidden', count === 0);
        }

        // Update cart total
        const cartTotal = document.querySelector('[data-cart-total]');
        if (cartTotal) {
            cartTotal.textContent = window.Utils.formatCurrency(total);
        }
    }

    /**
     * Render product card
     */
    function createProductCard(product) {
        const div = document.createElement('div');
        div.className = 'glass p-5 rounded-[2.5rem] hover:bg-zinc-800 transition-all';
        div.innerHTML = `
            <div class="h-48 w-full rounded-3xl overflow-hidden mb-4">
                <img src="${window.Utils.escapeHtml(product.image)}"
                     alt="${window.Utils.escapeHtml(product.name)}"
                     loading="lazy"
                     class="w-full h-full object-cover">
            </div>
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-bold text-white">${window.Utils.escapeHtml(product.name)}</h3>
                <span class="px-3 py-1 bg-rose-600 text-white text-xs rounded-full font-bold">
                    ${window.Utils.formatCurrency(product.price)}
                </span>
            </div>
            <p class="text-sm text-zinc-400 mb-4 line-clamp-2">${window.Utils.escapeHtml(product.desc || '')}</p>
            <div class="flex gap-2">
                <button onclick="CartModule.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')}, 1)"
                        class="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl transition-all"
                        ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        `;
        return div;
    }

    /**
     * Subscribe to state changes for reactive updates
     */
    function setupReactivity() {
        // Cart updates
        window.StateManager.subscribe('cart', updateCartUI);

        // Window resize
        window.addEventListener('debouncedResize', () => {
            // Handle responsive adjustments
        });

        // Notifications
        window.StateManager.subscribe('notifications', (notifications) => {
            // Handle notifications display
        });
    }

    /**
     * Initialize UI
     */
    function init() {
        setupReactivity();
        updateCartUI();

        // Set initial tab
        navigate('home');
    }

    return {
        showToast,
        navigate,
        toggleSidebar,
        closeSidebar,
        showModal,
        hideModal,
        updateCartUI,
        createProductCard,
        setupReactivity,
        init
    };
})();

// Export globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIModule;
}
