import axios from 'axios';
import { clearAuthStorage } from '../utils/authStorage';
import { isAdminPath } from '../utils/sessionManager';

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://lx-backend-69fl.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (isAdminPath(window.location.pathname)) {
    return config;
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      const path = window.location.pathname;
      if (!isAdminPath(path) && path !== '/login' && path !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
