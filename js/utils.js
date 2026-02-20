/**
 * Frontend Utilities
 * Common helper functions for the frontend application
 */

/**
 * Debounce function
 * Delays execution of function until after specified wait time no input
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * Limits function execution to at mostonce per wait period
 */
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func(...args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func(...args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Sanitize user input
 * Removes potentially dangerous characters
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return escapeHtml(input.trim());
}

/**
 * Validate phone number format
 */
function validatePhoneNumber(phone) {
    if (!phone) return false;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.trim());
}

/**
 * Validate name (2-100 chars, no HTML)
 */
function validateName(name) {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) return false;
    if (/<[^>]*>/g.test(trimmed)) return false;
    return true;
}

/**
 * Validate price (positive number)
 */
function validatePrice(price) {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0;
}

/**
 * Format currency for display
 */
function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}

/**
 * Format date for display
 */
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format datetime for display
 */
function formatDateTime(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get status badge color
 */
function getStatusColor(status) {
    const colors = {
        'pending': '#FCD34D',     // yellow
        'confirmed': '#60A5FA',   // blue
        'preparing': '#F97316',   // orange
        'ready': '#4ADE80',       // green
        'delivered': '#10B981',   // emerald
        'cancelled': '#EF4444'    // red
    };
    return colors[status] || '#FFFFFF';
}

/**
 * Get status label
 */
function getStatusLabel(status) {
    const config = window.APP_CONFIG || {};
    return config.ORDER_STATUS_LABELS?.[status] || status;
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Get value from localStorage with expiry check
 */
function getStorageWithExpiry(key) {
    const item = sessionStorage.getItem(key);
    if (!item) return null;

    try {
        const data = JSON.parse(item);
        if (data.expiry && Date.now() > data.expiry) {
            sessionStorage.removeItem(key);
            return null;
        }
        return data.value;
    } catch {
        return null;
    }
}

/**
 * Set value in localStorage with expiry
 */
function setStorageWithExpiry(key, value, expiryMs) {
    const item = {
        value,
        expiry: expiryMs ? Date.now() + expiryMs : null
    };
    sessionStorage.setItem(key, JSON.stringify(item));
}

/**
 * Debounced window resize handler
 */
const debouncedResize = debounce(() => {
    window.dispatchEvent(new Event('debouncedResize'));
}, APP_CONFIG?.DEBOUNCE_RESIZE_MS || 150);

window.addEventListener('resize', debouncedResize);

/**
 * Check if window is mobile size
 */
function isMobileSize() {
    const breakpoint = window.APP_CONFIG?.BREAKPOINT_MOBILE || 640;
    return window.innerWidth < breakpoint;
}

/**
 * Check if window is tablet size
 */
function isTabletSize() {
    const mobile = window.APP_CONFIG?.BREAKPOINT_MOBILE || 640;
    const tablet = window.APP_CONFIG?.BREAKPOINT_TABLET || 1024;
    return window.innerWidth >= mobile && window.innerWidth < tablet;
}

/**
 * Check if window is desktop size
 */
function isDesktopSize() {
    const breakpoint = window.APP_CONFIG?.BREAKPOINT_TABLET || 1024;
    return window.innerWidth >= breakpoint;
}

// Export functions globally
window.Utils = {
    debounce,
    throttle,
    escapeHtml,
    sanitizeInput,
    validatePhoneNumber,
    validateName,
    validatePrice,
    formatCurrency,
    formatDate,
    formatDateTime,
    getStatusColor,
    getStatusLabel,
    isInViewport,
    getStorageWithExpiry,
    setStorageWithExpiry,
    isMobileSize,
    isTabletSize,
    isDesktopSize
};

// Also export individual functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.Utils;
}
