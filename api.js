// API Configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// API Helper Functions
const api = {
    async request(endpoint, options = {}) {
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json().catch(() => ({}));
            
            return {
                ok: response.ok,
                status: response.status,
                data,
            };
        } catch (error) {
            console.error('API Error:', error);
            return {
                ok: false,
                status: 0,
                data: { error: 'Unable to connect to server. Please try again.' },
            };
        }
    },

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    // Auth endpoints
    async login(username, password) {
        return this.post('/login', { username, password });
    },

    async register(username, password) {
        return this.post('/register', { username, password });
    },

    async logout() {
        return this.post('/logout');
    },

    async checkAuth() {
        return this.get('/check-auth');
    },

    // Prediction endpoints
    async predict(transactionData) {
        return this.post('/predict', transactionData);
    },

    async getHistory() {
        return this.get('/history');
    },
};

