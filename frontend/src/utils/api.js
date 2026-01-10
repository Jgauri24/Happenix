import axios from "axios";
import { getToken, clearAuthState } from './storage';

const api=axios.create({
    baseURL:import.meta.env.VITE_API_URL || 'https://happenix-lcjl.onrender.com',
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