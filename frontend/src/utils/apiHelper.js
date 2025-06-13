import api from '../config/api';

/**
 * Helper pour remplacer les fetch() directs par des appels API centralisés
 * Utilise la configuration axios centralisée
 */

// Helper pour les requêtes GET
export const apiGet = async (endpoint, options = {}) => {
  try {
    const response = await api.get(endpoint, options);
    return response.data;
  } catch (error) {
    console.error(`API GET Error (${endpoint}):`, error);
    throw error;
  }
};

// Helper pour les requêtes POST
export const apiPost = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await api.post(endpoint, data, options);
    return response.data;
  } catch (error) {
    console.error(`API POST Error (${endpoint}):`, error);
    throw error;
  }
};

// Helper pour les requêtes PUT
export const apiPut = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await api.put(endpoint, data, options);
    return response.data;
  } catch (error) {
    console.error(`API PUT Error (${endpoint}):`, error);
    throw error;
  }
};

// Helper pour les requêtes DELETE
export const apiDelete = async (endpoint, options = {}) => {
  try {
    const response = await api.delete(endpoint, options);
    return response.data;
  } catch (error) {
    console.error(`API DELETE Error (${endpoint}):`, error);
    throw error;
  }
};

// Helper pour les uploads de fichiers
export const apiUpload = async (endpoint, formData, onProgress = null) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    if (onProgress) {
      config.onUploadProgress = onProgress;
    }
    
    const response = await api.post(endpoint, formData, config);
    return response.data;
  } catch (error) {
    console.error(`API Upload Error (${endpoint}):`, error);
    throw error;
  }
};

// Helper pour construire l'URL complète (pour les cas où on a besoin de l'URL)
export const getApiUrl = (endpoint) => {
  return `${api.defaults.baseURL}${endpoint}`;
};

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  upload: apiUpload,
  getUrl: getApiUrl
}; 