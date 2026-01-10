import axios from "axios";
import { getToken, clearAuthState } from './storage';

const getBaseUrl = () => {
    // 1. If running on a deployed domain (not localhost), ALWAYS use the production backend
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'https://happenix-lcjl.onrender.com/api';
    }

    // 2. If local, try to use the environment variable, otherwise fallback to production backend
    //    This allows you to run frontend locally against the live backend if you want.
    return import.meta.env.VITE_API_URL || 'https://happenix-lcjl.onrender.com/api';
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