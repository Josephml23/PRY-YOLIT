import axios from 'axios';
import type { DashboardFiltros, DashboardStats } from '@/types';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardApi = {
  getStats: async (filtros: DashboardFiltros): Promise<DashboardStats> => {
    const params = new URLSearchParams({
      establecimiento: filtros.establecimiento,
      periodo: filtros.periodo,
      fecha_del: filtros.fechaDel,
    });
    const response = await api.get(`/v1/dashboard/stats?${params}`);
    return response.data;
  },
};

export default api;
