import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, User } from '../services/authService';
import { LoginCredentials, RegisterCredentials } from '../types';
import { Navigate } from 'react-router-dom';

// Constants
const AUTH_QUERY_KEY = ['user'] as const;
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// Types
interface AuthData {
  token: string;
  user: User;
  expiresAt: number;
}

export const useAuthMiddleware = () => {
  const queryClient = useQueryClient();

  // Helper functions
  const getStoredAuthData = (): AuthData | null => {
    try {
      const authDataString = localStorage.getItem('auth');
      if (!authDataString) return null;
      
      const authData = JSON.parse(authDataString) as AuthData;
      if (Date.now() > authData.expiresAt) {
        localStorage.removeItem('auth');
        return null;
      }
      
      return authData;
    } catch {
      localStorage.removeItem('auth');
      return null;
    }
  };

  const setAuthData = (token: string, user: User) => {
    const authData: AuthData = {
      token,
      user,
      expiresAt: Date.now() + TOKEN_EXPIRY,
    };
    localStorage.setItem('auth', JSON.stringify(authData));
    return authData;
  };

  // User Profile Query
  const {
    data: user,
    isLoading,
    isError,
    refetch
  } = useQuery<User | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const authData = getStoredAuthData();
      if (!authData) return null;

      try {
        return await authService.getUserProfile();
      } catch (error) {
        localStorage.removeItem('auth');
        throw error;
      }
    },
    staleTime: STALE_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Login Mutation
  const login = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const response = await authService.login(credentials);
      const authData = setAuthData(response.token, response.user);
      return authData.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, userData);
    },
  });

  // Register Mutation
  const register = useMutation<User, Error, RegisterCredentials>({
    mutationFn: async (credentials) => {
      const response = await authService.register(credentials);
      const authData = setAuthData(response.token, response.user);
      return authData.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, userData);
    },
  });

  // Logout Mutation
  const logout = useMutation<void, Error>({
    mutationFn: async () => {
      try {
        localStorage.removeItem('auth');
        queryClient.clear();
        queryClient.setQueryData(AUTH_QUERY_KEY, null);
        
        // With HashRouter, use hash-based routing
        window.location.hash = '#/login';
      } catch (error) {
        console.error('Logout failed:', error);
        throw error;
      }
    }
  });

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    refetch,
  };
};