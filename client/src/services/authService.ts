import api from './api';
import { UserRole } from '../types';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`/auth/login`, credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`/auth/register`, credentials);
    return response.data;
  },

  async getUserProfile(): Promise<User> {
    const response = await api.get<User>(`/auth/profile`);
    return response.data;
  },

  logout() {
    localStorage.removeItem('auth');
    window.location.reload(); // ! So that every component can re-render
    window.location.href = '/';
  },
};