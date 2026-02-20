/**
 * Application State Management
 * Centralized state for the frontend application
 */

// Global application state
const AppState = {
    // Authentication
    currentUser: null,
    userToken: null,
    isAuthenticated: false,

    // Navigation
    currentTab: 'home',
    previousTab: null,

    // Products
    menuData: [],
    searchQuery: '',
    currentCategory: 'all',
    selectedProduct: null,

    // Cart
    cart: [],
    cartTotal: 0,

    // Orders
    userOrders: [],
    allOrders: [],
    selectedOrder: null,

    // Admin
    inventoryFilter: 'all',
    selectedInventoryProduct: null,

    // UI State
    isSidebarOpen: false,
    isPopupOpen: false,
    popupTitle: '',
    popupContent: '',
    popupCallback: null,

    // Loading & Errors
    isLoading: false,
    lastError: null,
    notifications: []
};

/**
 * State observers for reactive updates
 */
const stateObservers = {};

/**
 * Get state value
 */
function getState(key) {
    return AppState[key];
}

/**
 * Update state with notification to observers
 */
function setState(key, value) {
    const oldValue = AppState[key];

    // Only update if value changed
    if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
        AppState[key] = value;

        // Notify all listeners for this key
        if (stateObservers[key]) {
            stateObservers[key].forEach(callback => {
                try {
                    callback(value, oldValue);
                } catch (error) {
                    console.error(`Observer callback error for ${key}:`, error);
                }
            });
        }
    }

    return AppState;
}

/**
 * Update multiple state values at once
 */
function setStateMultiple(updates) {
    Object.entries(updates).forEach(([key, value]) => {
        setState(key, value);
    });
}

/**
 * Subscribe to state changes
 */
function subscribe(key, callback) {
    if (!stateObservers[key]) {
        stateObservers[key] = [];
    }
    stateObservers[key].push(callback);

    // Return unsubscribe function
    return () => {
        const index = stateObservers[key].indexOf(callback);
        if (index > -1) {
            stateObservers[key].splice(index, 1);
        }
    };
}

/**
 * Clear specific state
 */
function clearState(key) {
    setState(key, null);
}

/**
 * Reset entire state (for logout)
 */
function resetState() {
    const newState = {
        currentUser: null,
        userToken: null,
        isAuthenticated: false,
        currentTab: 'home',
        previousTab: null,
        menuData: [],
        searchQuery: '',
        currentCategory: 'all',
        selectedProduct: null,
        cart: [],
        cartTotal: 0,
        userOrders: [],
        selectedOrder: null,
        inventoryFilter: 'all',
        selectedInventoryProduct: null,
        isSidebarOpen: false,
        isPopupOpen: false,
        popupTitle: '',
        popupContent: '',
        popupCallback: null,
        isLoading: false,
        lastError: null,
        notifications: []
    };

    Object.entries(newState).forEach(([key, value]) => {
        setState(key, value);
    });
}

/**
 * Add notification
 */
function addNotification(title, message, type = 'info', duration = 3000) {
    const id = Date.now();
    const notification = { id, title, message, type };

    setState('notifications', [...getState('notifications'), notification]);

    if (duration > 0) {
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    }

    return id;
}

/**
 * Remove notification
 */
function removeNotification(id) {
    setState('notifications', getState('notifications').filter(n => n.id !== id));
}

/**
 * Get current user role
 */
function isAdmin() {
    return getState('currentUser')?.role === 'admin';
}

/**
 * Get authentication token
 */
function getToken() {
    return getState('userToken');
}

/**
 * Set authentication data
 */
function setAuthentication(user, token) {
    setState('currentUser', user);
    setState('userToken', token);
    setState('isAuthenticated', !!token);

    // Store in sessionStorage
    if (token) {
        sessionStorage.setItem(window.APP_CONFIG?.STORAGE_KEYS?.AUTH_TOKEN || 'authToken', token);
        sessionStorage.setItem(window.APP_CONFIG?.STORAGE_KEYS?.USER_ROLE || 'userRole', user.role);
        sessionStorage.setItem(window.APP_CONFIG?.STORAGE_KEYS?.USER_NAME || 'userName', user.name);
        sessionStorage.setItem(window.APP_CONFIG?.STORAGE_KEYS?.USER_PHONE || 'userPhone', user.phone);
    }
}

/**
 * Clear authentication data
 */
function clearAuthentication() {
    setState('currentUser', null);
    setState('userToken', null);
    setState('isAuthenticated', false);

    // Clear sessionStorage
    const storageKeys = window.APP_CONFIG?.STORAGE_KEYS || {};
    Object.values(storageKeys).forEach(key => {
        sessionStorage.removeItem(key);
    });
}

/**
 * Export state management functions globally
 */
window.StateManager = {
    AppState,
    getState,
    setState,
    setStateMultiple,
    subscribe,
    clearState,
    resetState,
    addNotification,
    removeNotification,
    isAdmin,
    getToken,
    setAuthentication,
    clearAuthentication
};

// Also export for CommonJS if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.StateManager;
}
