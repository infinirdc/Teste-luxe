const API_URL = '/api';

async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('token');
    if (token) {
        headers['x-auth-token'] = token;
    }

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.msg || data.message || 'Une erreur est survenue');
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
