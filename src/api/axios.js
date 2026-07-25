import axios from 'axios';
import { clearAuthStorage } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('badminton_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isLoginRequest = requestUrl.includes('/login');

      // Chỉ xử lý hết hạn phiên nếu không phải là request đăng nhập thất bại
      if (!isLoginRequest) {
        clearAuthStorage();
        window.dispatchEvent(
          new CustomEvent('badminton:unauthorized', {
            detail: { message: error.response?.data?.message || 'Phiên đăng nhập đã hết hạn' },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
