import axios from 'axios';

// Centralized API configuration
const RAW_API_URL = import.meta.env.VITE_API_URL || '';
// Normalize: remove trailing slash and trailing '/api' if provided
export const API_BASE_URL = RAW_API_URL.replace(/\/$/, '').replace(/\/api$/i, '');

// Debug logs (only in dev)
if (import.meta.env.MODE !== 'production') {
  console.log('🔗 Configuration API:');
  console.log('  - VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('  - API_BASE_URL:', API_BASE_URL);
  console.log('  - Environment:', import.meta.env.MODE);
  console.log('  - Base API URL:', `${API_BASE_URL}/api`);
}

// Axios instance using the normalized base + /api
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach auth token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token handling (single-flight)
let isRefreshing = false;
let refreshSubscribers = [];
const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (token) => refreshSubscribers.forEach((cb) => cb(token));

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalReq = err.config;
    if (!err.response || err.response.status !== 401) return Promise.reject(err);
    if (originalReq._retry) {
      // Already retried
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) return reject(new Error('Refresh failed'));
          originalReq._retry = true;
          originalReq.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalReq));
        });
      });
    }

    isRefreshing = true;
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      const resp = await api.post('/auth/refresh-token', { refreshToken });
      const newToken = resp.data?.token;
      const newRefresh = resp.data?.refreshToken;
      if (newToken) {
        localStorage.setItem('token', newToken);
        if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
        onRefreshed(newToken);
        refreshSubscribers = [];
        originalReq._retry = true;
        originalReq.headers.Authorization = `Bearer ${newToken}`;
        return api(originalReq);
      }
      throw new Error('Refresh failed');
    } catch (refreshErr) {
      refreshSubscribers = [];
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    // Auth
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',

    // Users
    profile: '/users/profile',
    updateProfile: '/users/profile',

    // VAE
    vaeList: '/vae', // GET /api/vae?page=..&limit=..
    vaeCreate: '/vae',
    vaeDetail: (id) => `/vae/${id}`,
    vaeUpdate: (id) => `/vae/${id}`,
    vaeDelete: (id) => `/vae/${id}`,

    // Documents
    uploadDocument: '/documents',
    documentList: '/documents',
    documentDelete: (id) => `/documents/${id}`,

    // AI
    aiChat: '/ai/chat',
    aiSuggestions: '/ai/suggestions',
    aiAnalyze: '/ai/analyze-document',
    aiGenerateVae: '/ai/generate-vae',

    // Dashboard
    dashboardStats: '/dashboard/stats',
    dashboardActivity: '/dashboard/activity',
    dashboardInsights: '/dashboard/insights',

    // Health
    health: '/health',
  },
};

// Backwards-compatible export for older code that imports API_ENDPOINTS
export const API_ENDPOINTS = API_CONFIG.endpoints;

// Backwards-compatible helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const buildApiUrl = (endpoint) => {
  if (typeof endpoint === 'function') return (...args) => `${API_BASE_URL}/api${endpoint(...args)}`;
  return `${API_BASE_URL}/api${endpoint}`;
};

export { api };
export default API_CONFIG;