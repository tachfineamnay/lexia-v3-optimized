import axios from 'axios';

// Configuration API centralisée
const API_URL = import.meta.env.VITE_API_URL || '';

// Enlever le slash final s'il existe
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Logs de debug plus détaillés
console.log('🔗 Configuration API:');
console.log('  - VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('  - API_BASE_URL:', API_BASE_URL);
console.log('  - Environment:', import.meta.env.MODE);
console.log('  - Base URL complète:', `${API_BASE_URL}/api`);

// Create axios instance (baseURL without '/api' suffix — endpoints include '/api' prefix)
const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // If no response or not 401, just reject
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (originalRequest._retry) {
      // Already retried, force logout
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Queue to handle multiple 401s while refreshing
    if (!api._isRefreshing) {
      api._isRefreshing = true;
      api._refreshSubscribers = [];

      const refreshToken = localStorage.getItem('refreshToken');

      // Attempt refresh
      return api.post('/auth/refresh-token', { refreshToken })
        .then((res) => {
          const newToken = res.data?.token;
          if (newToken) {
            localStorage.setItem('token', newToken);
            api._isRefreshing = false;
            api._refreshSubscribers.forEach((cb) => cb(null, newToken));
            api._refreshSubscribers = [];
            // retry original request with new token
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
          throw new Error('Refresh failed');
        })
        .catch((refreshErr) => {
          api._isRefreshing = false;
          api._refreshSubscribers.forEach((cb) => cb(refreshErr));
          api._refreshSubscribers = [];
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        });
    }

    // If refresh already in progress, return a promise that resolves when refreshed
    return new Promise((resolve, reject) => {
      api._refreshSubscribers.push((err, newToken) => {
        if (err) return reject(err);
        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(api(originalRequest));
      });
    });
  }
);

// API Endpoints (for reference)
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  
  // User endpoints
  USERS: '/users',
  
  // Document endpoints
  DOCUMENTS: '/documents',
  
  // AI endpoints
  AI_GENERATE_VAE: '/ai/generate-vae',
  AI_ANALYZE: '/ai/analyze',
  AI_CHAT: '/ai/chat',
  AI_SUGGESTIONS: '/ai/suggestions',
  
  // Upload endpoints
  UPLOAD: '/uploads',
  
  // Question endpoints
  QUESTIONS: '/questions',
  
  // Config endpoints
  CONFIG: '/config',
  
  // Dashboard endpoints
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_ACTIVITY: '/dashboard/activity',
  DASHBOARD_INSIGHTS: '/dashboard/insights',
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
  // Auth endpoints
  login: '/api/auth/login',
  register: '/api/auth/register',
    logout: '/api/auth/logout',
    refreshToken: '/api/auth/refresh-token',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    verifyEmail: '/api/auth/verify-email',
    
    // User endpoints
    profile: '/api/users/profile',
    updateProfile: '/api/users/profile',
    
  // VAE endpoints
  vaeList: '/api/vae/list',
    vaeCreate: '/api/vae',
    vaeDetail: (id) => `/api/vae/${id}`,
    vaeUpdate: (id) => `/api/vae/${id}`,
    vaeDelete: (id) => `/api/vae/${id}`,
    
  // Document endpoints
  uploadDocument: '/api/documents',
    documentList: '/api/documents',
    documentDelete: (id) => `/api/documents/${id}`,
    
    // AI endpoints
    aiChat: '/api/ai/chat',
    aiSuggestions: '/api/ai/suggestions',
    aiAnalyze: '/api/ai/analyze-document',
    
    // Dashboard endpoints
    dashboardStats: '/api/dashboard/stats',
    dashboardActivity: '/api/dashboard/activity',
    dashboardInsights: '/api/dashboard/insights',
    
    // Health check
    health: '/api/health'
  }
};

// Helper pour construire les URLs complètes
export const buildApiUrl = (endpoint) => {
  if (typeof endpoint === 'function') {
    return (...args) => `${API_BASE_URL}${endpoint(...args)}`;
  }
  return `${API_BASE_URL}${endpoint}`;
};

// Export axios instance for direct use
export { api };

export default API_CONFIG; 