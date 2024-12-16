import axios, { AxiosError, AxiosResponse } from 'axios';
import { AdminUser, SecurityAlert, UserSecurityProfile } from '../types/security';

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

interface LoginResponse {
  token: string;
  user: AdminUser;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Autenticação
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/admin/login', { email, password });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Usuários
  getUsers: async (): Promise<AdminUser[]> => {
    try {
      const response = await api.get<ApiResponse<AdminUser[]>>('/admin/users');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserDetails: async (userId: number): Promise<AdminUser> => {
    try {
      const response = await api.get<ApiResponse<AdminUser>>(`/admin/users/${userId}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  blockUser: async (userId: number, reason: string): Promise<void> => {
    try {
      await api.post(`/admin/users/${userId}/block`, { reason });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Segurança
  getSecurityAlerts: async (): Promise<SecurityAlert[]> => {
    try {
      const response = await api.get<ApiResponse<SecurityAlert[]>>('/admin/security/alerts');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getAuditLogs: async (startDate?: string, endDate?: string) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await api.get('/admin/security/audit-logs', { params });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getSuspiciousActivities: async () => {
    try {
      const response = await api.get('/admin/security/suspicious-activities');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  investigateUser: async (userId: number) => {
    try {
      const response = await api.post(`/admin/security/investigate/${userId}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Dashboard
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<any>>;
    return new Error(
      axiosError.response?.data?.message || 
      'Ocorreu um erro na comunicação com o servidor'
    );
  }
  return new Error('Ocorreu um erro inesperado');
};
