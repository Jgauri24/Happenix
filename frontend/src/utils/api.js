import axios from "axios";
import { getToken, clearAuthState } from './storage';

const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    const isProd = import.meta.env.PROD;
    
    // If in production and env var points to localhost, ignore it and use production URL
    if (isProd && envUrl && envUrl.includes('localhost')) {
        return 'https://happenix-lcjl.onrender.com/api';
    }
    
    return envUrl || 'https://happenix-lcjl.onrender.com/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
      },
})

// requesting interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthState();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export default api