/**
 * Frontend Configuration
 * Centralized configuration constants for the frontend application
 */

// API Configuration
const API_BASE_URL = window.location.origin + '/api' || 'http://localhost:3000/api';
const FETCH_TIMEOUT_MS = 5000;
const API_RETRY_COUNT = 3;
const API_RETRY_DELAY_MS = 1000;

// UI Configuration
const DEBOUNCE_SEARCH_MS = 300;
const DEBOUNCE_RESIZE_MS = 150;
const TOAST_DURATION_MS = 3000;
const BREAKPOINT_MOBILE = 640;
const BREAKPOINT_TABLET = 1024;
const BREAKPOINT_DESKTOP = 1280;

// Product Categories
const CATEGORIES = ['all', 'repas', 'boisson', 'dessert', 'entree'];
const CATEGORY_LABELS = {
    'all': 'Tous',
    'repas': 'Repas',
    'boisson': 'Boissons',
    'dessert': 'Desserts',
    'entree': 'Entrées'
};

// Order Status
const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const ORDER_STATUS_LABELS = {
    'pending': 'En attente',
    'confirmed': 'Confirmée',
    'preparing': 'En préparation',
    'ready': 'Prête',
    'delivered': 'Livrée',
    'cancelled': 'Annulée'
};

// Storage Keys
const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    USER_ROLE: 'userRole',
    USER_NAME: 'userName',
    USER_PHONE: 'userPhone',
    CART: 'cart',
    PRODUCTS_CACHE: 'productsCache',
    PRODUCTS_CACHE_TIME: 'productsCacheTime'
};

// Cache Durations (in milliseconds)
const CACHE_DURATIONS = {
    PRODUCTS: 5 * 60 * 1000,  // 5 minutes
    ORDERS: 2 * 60 * 1000,     // 2 minutes
    STATS: 10 * 60 * 1000      // 10 minutes
};

// Export all configuration
window.APP_CONFIG = {
    API_BASE_URL,
    FETCH_TIMEOUT_MS,
    API_RETRY_COUNT,
    API_RETRY_DELAY_MS,
    DEBOUNCE_SEARCH_MS,
    DEBOUNCE_RESIZE_MS,
    TOAST_DURATION_MS,
    BREAKPOINT_MOBILE,
    BREAKPOINT_TABLET,
    BREAKPOINT_DESKTOP,
    CATEGORIES,
    CATEGORY_LABELS,
    ORDER_STATUSES,
    ORDER_STATUS_LABELS,
    STORAGE_KEYS,
    CACHE_DURATIONS
};

// Also export for CommonJS if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.APP_CONFIG;
}
