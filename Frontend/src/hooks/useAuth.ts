import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Recuperar tokens do localStorage
  const getStoredTokens = useCallback((): AuthTokens | null => {
    const tokens = localStorage.getItem('auth_tokens');
    return tokens ? JSON.parse(tokens) : null;
  }, []);

  // Configurar axios com token
  const setupAxiosInterceptors = useCallback((tokens: AuthTokens) => {
    axios.interceptors.request.use((config) => {
      if (tokens.access_token) {
        config.headers.Authorization = `Bearer ${tokens.access_token}`;
      }
      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const response = await axios.post('/api/auth/refresh', {
              token: tokens.refresh_token,
            });
            const newTokens = response.data;
            localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
            originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
            return axios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }, []);

  // Query para usuário atual
  const { data: user } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const tokens = getStoredTokens();
      if (!tokens) return null;
      const response = await axios.get('/api/users/me');
      return response.data;
    },
    retry: false,
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await axios.post('/api/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data: AuthTokens) => {
      localStorage.setItem('auth_tokens', JSON.stringify(data));
      setupAxiosInterceptors(data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/dashboard');
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Login failed');
    },
  });

  // Mutation para registro
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await axios.post('/api/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      navigate('/login');
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Registration failed');
    },
  });

  // Função de logout
  const logout = useCallback(() => {
    localStorage.removeItem('auth_tokens');
    queryClient.clear();
    navigate('/login');
  }, [navigate, queryClient]);

  // Inicialização
  const initialize = useCallback(() => {
    const tokens = getStoredTokens();
    if (tokens) {
      setupAxiosInterceptors(tokens);
    }
  }, [getStoredTokens, setupAxiosInterceptors]);

  return {
    user,
    error,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    initialize,
    isLoading: loginMutation.isPending || registerMutation.isPending,
  };
};

export default useAuth;
