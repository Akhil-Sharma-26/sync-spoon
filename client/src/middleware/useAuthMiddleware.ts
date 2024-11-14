import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, User } from '../services/authService';
import { LoginCredentials, RegisterCredentials } from '../types';


const AUTH_QUERY_KEY = ['user'];

export const useAuthMiddleware = () => {
  const queryClient = useQueryClient();

  // User Profile Query
  const { 
    data: user, 
    isLoading, 
    isError,
    refetch 
  } = useQuery<User | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const authDataString = localStorage.getItem('auth');
      
      if (!authDataString) return null;
      
      const authData = JSON.parse(authDataString);
      
      // Check token expiration
      if (Date.now() > authData.expiresAt) {
        localStorage.removeItem('auth');
        return null;
      }
      
      try {
        const fetchedUser = await authService.getUserProfile();
        
        // Update stored user data
        const updatedAuthData = {
          ...authData,
          user: fetchedUser
        };
        localStorage.setItem('auth', JSON.stringify(updatedAuthData));
        
        return fetchedUser;
      } catch (error) {
        localStorage.removeItem('auth');
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  // Login Mutation
  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      
      const authData = {
        token: response.token,
        user: response.user,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      };
      
      localStorage.setItem('auth', JSON.stringify(authData));
      
      return response.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, userData);
    }
  });

  // Register Mutation
  const register = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await authService.register(credentials);
      
      const authData = {
        token: response.token,
        user: response.user,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      };
      
      localStorage.setItem('auth', JSON.stringify(authData));
      
      return response.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, userData);
    }
  });

  // Logout Mutation
  const logout = useMutation({
    mutationFn: () => {
      localStorage.removeItem('auth');
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      return Promise.resolve();
    }
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isError,
    login,
    register,
    logout,
    refetch
  };
};