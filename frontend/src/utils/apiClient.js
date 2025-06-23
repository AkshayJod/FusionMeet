import axios from 'axios';
import { config } from '../environment';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error);

        // Handle network errors
        if (!error.response) {
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                type: 'network'
            });
        }

        // Handle HTTP errors
        const { status, data } = error.response;

        switch (status) {
            case 400:
                return Promise.reject({
                    message: data.message || 'Invalid request',
                    errors: data.errors || [],
                    type: 'validation'
                });
            case 401:
                // Token expired or invalid
                localStorage.removeItem('token');
                window.location.href = '/auth';
                return Promise.reject({
                    message: 'Session expired. Please login again.',
                    type: 'auth'
                });
            case 403:
                return Promise.reject({
                    message: 'Access denied',
                    type: 'permission'
                });
            case 404:
                return Promise.reject({
                    message: data.message || 'Resource not found',
                    type: 'notfound'
                });
            case 409:
                return Promise.reject({
                    message: data.message || 'Conflict occurred',
                    type: 'conflict'
                });
            case 500:
                return Promise.reject({
                    message: 'Server error. Please try again later.',
                    type: 'server'
                });
            default:
                return Promise.reject({
                    message: data.message || 'An unexpected error occurred',
                    type: 'unknown'
                });
        }
    }
);

// API methods
export const api = {
    // Auth endpoints
    auth: {
        login: (credentials) => apiClient.post('/users/login', credentials),
        register: (userData) => apiClient.post('/users/register', userData),
    },

    // Meeting endpoints
    meetings: {
        create: (meetingData) => apiClient.post('/users/create_meeting', meetingData),
        getInfo: (meetingId) => apiClient.get(`/users/meeting/${meetingId}`),
        addToHistory: (meetingCode) => apiClient.post('/users/add_to_activity', { meeting_code: meetingCode }),
        getHistory: () => apiClient.get('/users/get_all_activity'),
    },

    // Notification endpoints
    notifications: {
        getAll: (params = {}) => apiClient.get('/notifications', { params }),
        create: (notificationData) => apiClient.post('/notifications/create', notificationData),
        markAsRead: (notificationId) => apiClient.post('/notifications/mark-read', { notificationId }),
        markAllAsRead: () => apiClient.post('/notifications/mark-all-read'),
        delete: (notificationId) => apiClient.delete(`/notifications/${notificationId}`),
    },

    // Health check
    health: () => apiClient.get('/health'),
};

export default apiClient;
