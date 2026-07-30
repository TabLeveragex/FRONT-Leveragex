import axios from 'axios';
import { clearAdminStorage } from '../utils/authStorage';
import { isAdminPath } from '../utils/sessionManager';
import { API_BASE_URL } from './api';

export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use((config) => {
  if (!isAdminPath(window.location.pathname)) {
    return config;
  }
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAdminStorage();
      const path = window.location.pathname;
      if (path !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default adminApi;
