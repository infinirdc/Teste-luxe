/**
 * Frontend Authentication Module
 * Handles user login, registration, and authentication flow
 */

const AuthModule = (() => {
    /**
     * Register new visitor
     */
    async function register(name, phone) {
        try {
            window.StateManager.setState('isLoading', true);

            // Validate inputs
            if (!window.Utils.validateName(name)) {
                throw new Error('Name must be 2-100 characters without HTML tags');
            }
            if (!window.Utils.validatePhoneNumber(phone)) {
                throw new Error('Invalid phone number format');
            }

            const response = await window.API.Auth.register(name, phone);

            if (response.success) {
                window.StateManager.setAuthentication(response.data.user, response.data.token);
                window.StateManager.addNotification('Success', 'Registration successful!', 'success');
                return response.data;
            } else {
                throw new Error(response.message || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration error:', error);
            window.StateManager.setState('lastError', error.message);
            window.StateManager.addNotification('Error', error.message || 'Registration failed', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Login visitor
     */
    async function login(phone) {
        try {
            window.StateManager.setState('isLoading', true);

            // Validate input
            if (!window.Utils.validatePhoneNumber(phone)) {
                throw new Error('Invalid phone number format');
            }

            const response = await window.API.Auth.login(phone);

            if (response.success) {
                window.StateManager.setAuthentication(response.data.user, response.data.token);
                window.StateManager.addNotification('Success', 'Login successful!', 'success');
                return response.data;
            } else {
                throw new Error(response.message || 'Login failed');
            }

        } catch (error) {
            console.error('Login error:', error);
            window.StateManager.setState('lastError', error.message);
            window.StateManager.addNotification('Error', error.message || 'Login failed', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Admin login
     */
    async function adminLogin(username, password) {
        try {
            window.StateManager.setState('isLoading', true);

            const response = await window.API.Auth.adminLogin(username, password);

            if (response.success) {
                window.StateManager.setAuthentication(response.data.user, response.data.token);
                window.StateManager.addNotification('Success', 'Admin login successful!', 'success');
                return response.data;
            } else {
                throw new Error(response.message || 'Admin login failed');
            }

        } catch (error) {
            console.error('Admin login error:', error);
            window.StateManager.setState('lastError', error.message);
            window.StateManager.addNotification('Error', error.message || 'Admin login failed', 'error');
            throw error;

        } finally {
            window.StateManager.setState('isLoading', false);
        }
    }

    /**
     * Logout user
     */
    function logout() {
        window.StateManager.clearAuthentication();
        window.StateManager.setState('cart', []);
        window.StateManager.setState('currentTab', 'home');
        window.StateManager.addNotification('Success', 'Logged out successfully', 'success');
    }

    /**
     * Restore session from storage
     */
    function restoreSession() {
        const token = sessionStorage.getItem(window.APP_CONFIG?.STORAGE_KEYS?.AUTH_TOKEN || 'authToken');
        const role = sessionStorage.getItem(window.APP_CONFIG?.STORAGE_KEYS?.USER_ROLE || 'userRole');
        const name = sessionStorage.getItem(window.APP_CONFIG?.STORAGE_KEYS?.USER_NAME || 'userName');
        const phone = sessionStorage.getItem(window.APP_CONFIG?.STORAGE_KEYS?.USER_PHONE || 'userPhone');

        if (token && name && phone) {
            const user = { role, name, phone };
            window.StateManager.setAuthentication(user, token);
            return true;
        }
        return false;
    }

    return {
        register,
        login,
        adminLogin,
        logout,
        restoreSession
    };
})();

// Export globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthModule;
}
