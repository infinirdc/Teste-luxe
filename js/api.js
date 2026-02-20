/**
 * API Wrapper with Error Handling
 * Centralized API communication with timeout, retry, and error handling
 */

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options = {}) {
    const timeout = options.timeout || (window.APP_CONFIG?.FETCH_TIMEOUT_MS || 5000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(url, options = {}) {
    const maxRetries = options.retries || (window.APP_CONFIG?.API_RETRY_COUNT || 3);
    const retryDelay = window.APP_CONFIG?.API_RETRY_DELAY_MS || 1000;

    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fetchWithTimeout(url, options);
        } catch (error) {
            lastError = error;

            // Don't retry on certain errors
            if (error.name === 'AbortError' && i < maxRetries - 1) {
                console.warn(`Timeout on attempt ${i + 1}, retrying...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } else {
                break;
            }
        }
    }

    throw lastError;
}

/**
 * Make API request with auth header
 */
async function apiRequest(endpoint, options = {}) {
    const baseUrl = window.APP_CONFIG?.API_BASE_URL || '/api';
    const url = `${baseUrl}${endpoint}`;
    const token = window.StateManager?.getToken?.();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetchWithRetry(url, {
            ...options,
            headers,
            timeout: 5000
        });

        // Handle non-2xx responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `HTTP Error: ${response.status}`);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        throw error;
    }
}

/**
 * Authentication endpoints
 */
const Auth = {
    register: (name, phone) =>
        apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, phone })
        }),

    login: (phone) =>
        apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone })
        }),

    adminLogin: (username, password) =>
        apiRequest('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        }),

    verify: () =>
        apiRequest('/auth/verify', { method: 'GET' })
};

/**
 * Product endpoints
 */
const Products = {
    getAll: (page = 1, limit = 20) =>
        apiRequest(`/products?page=${page}&limit=${limit}`, { method: 'GET' }),

    getById: (id) =>
        apiRequest(`/products/${id}`, { method: 'GET' }),

    create: (productData) =>
        apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        }),

    update: (id, productData) =>
        apiRequest(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        }),

    delete: (id) =>
        apiRequest(`/products/${id}`, { method: 'DELETE' }),

    updateStock: (id, stock) =>
        apiRequest(`/products/${id}/stock`, {
            method: 'PUT',
            body: JSON.stringify({ stock })
        }),

    seed: () =>
        apiRequest('/products/seed/initial', {
            method: 'POST'
        })
};

/**
 * Order endpoints
 */
const Orders = {
    create: (orderData) =>
        apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        }),

    getCustomerOrders: (phone, status = null, page = 1) =>
        apiRequest(`/orders/user/${encodeURIComponent(phone)}?page=${page}${status ? `&status=${status}` : ''}`, {
            method: 'GET'
        }),

    getById: (id) =>
        apiRequest(`/orders/${id}`, { method: 'GET' }),

    getAll: (page = 1, limit = 20, status = null) =>
        apiRequest(`/orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`, {
            method: 'GET'
        }),

    updateStatus: (id, status) =>
        apiRequest(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        })
};

/**
 * Statistics endpoints
 */
const Stats = {
    getDashboard: () =>
        apiRequest('/stats/dashboard', { method: 'GET' }),

    getProducts: () =>
        apiRequest('/stats/products', { method: 'GET' }),

    getTrends: () =>
        apiRequest('/stats/trends', { method: 'GET' })
};

/**
 * Export API functions globally
 */
window.API = {
    Auth,
    Products,
    Orders,
    Stats,
    apiRequest,
    fetchWithTimeout,
    fetchWithRetry
};

// Also export for CommonJS if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.API;
}
