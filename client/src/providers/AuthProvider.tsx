// AuthProvider.tsx
import React from 'react';
import { 
  QueryClient, 
  QueryClientProvider, 
  useQuery, 
  useMutation 
} from '@tanstack/react-query';
import axios from 'axios';
import { User, authService, LoginCredentials, RegisterCredentials } from '../services/authService';
import { UserRole } from '../types';

// Configure axios to use token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create a query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    },
  },
});

// Authentication Hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      
      // Store token and user in localStorage with expiration
      const authData = {
        token: response.token,
        user: response.user,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
      };
      
      localStorage.setItem('auth', JSON.stringify(authData));
      
      return response.user;
    },
    onSuccess: (user) => {
      // Update the user query data
      queryClient.setQueryData(['user'], user);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await authService.register(credentials);
      
      // Store token and user in localStorage with expiration
      const authData = {
        token: response.token,
        user: response.user,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
      };
      
      localStorage.setItem('auth', JSON.stringify(authData));
      
      return response.user;
    },
    onSuccess: (user) => {
      // Update the user query data
      queryClient.setQueryData(['user'], user);
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => {
      // Clear localStorage
      localStorage.removeItem('auth');
      
      // Remove user query data
      queryClient.removeQueries({ queryKey: ['user'] });
      
      return Promise.resolve();
    },
  });
};

export const useAuth = () => {
  const { 
    data: user, 
    isLoading, 
    isError,
    refetch
  } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      // Check stored auth data
      const authDataString = localStorage.getItem('auth');
      
      if (!authDataString) return null;
      
      const authData = JSON.parse(authDataString);
      
      // Check if token is expired
      if (Date.now() > authData.expiresAt) {
        localStorage.removeItem('auth');
        return null;
      }
      
      try {
        // Validate token and get user profile
        const fetchedUser = await authService.getUserProfile();
        
        // Update stored user data if profile fetch is successful
        const updatedAuthData = {
          ...authData,
          user: fetchedUser
        };
        localStorage.setItem('auth', JSON.stringify(updatedAuthData));
        
        return fetchedUser;
      } catch (error) {
        // If token validation fails, clear storage
        localStorage.removeItem('auth');
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isError,
    login: useLogin(),
    register: useRegister(),
    logout: useLogout(),
    refetch,
  };
};

// Authentication Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};