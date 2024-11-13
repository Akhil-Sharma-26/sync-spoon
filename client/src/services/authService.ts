import api from './api';
import { FoodItem, HolidaySchedule, UserRole } from '../types';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface FeedbackData {
  meal_date: string;
  meal_type: string;
  rating: number;
  comment: string;
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

export interface ConsumptionRecord {
  food_item_id: number;
  quantity: number;
  date: string; // Format: YYYY-MM-DD
  meal_type: string; // e.g., "breakfast", "lunch", "dinner"

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

  async recordConsumption(consumptionData: ConsumptionRecord): Promise<ConsumptionRecord> {
    const response = await api.post<ConsumptionRecord>(`/consumption`, consumptionData);
    return response.data;
  },

  getFoodItems: async () => {
    const response = await api.get('/food-items'); // Adjust the endpoint as necessary
    if (!response.data) {
      throw new Error('Failed to fetch food items');
    }
    console.log(response.data);
    return response.data; // Ensure this returns an array of FoodItem objects
  },

  submitFeedback: async (feedbackData: FeedbackData) => {
    const response = await api.post('/feedback', feedbackData);
    if (!response.data) {
      throw new Error('Failed to submit feedback');
    }
    return response.data;
  },

  getMenuItems: async (date: string, mealType: string) => {
    const response = await api.get(`/menu-items?date=${date}&mealType=${mealType}`);
    if (!response.data) {
      throw new Error('Failed to fetch menu items');
    }
    return response.data; 
  },

  createHolidaySchedule: async (holidayData: HolidaySchedule) => {
    const response = await api.post('/holiday-schedule', holidayData);
    if (!response.data) {
      throw new Error('Failed to create holiday schedule');
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('auth');
    window.location.reload(); // ! So that every component can re-render
    window.location.href = '/';
  },

  getConsumptionRecords: async (): Promise<ConsumptionRecord[]> => {
    const response = await api.get(`/consumption`);
    if (!response.data) {
      throw new Error("Failed to fetch consumption records");
    }
    return response.data;
  },


  getFeedbacks: async (): Promise<FeedbackData[]> => {
    const response = await api.get(`/feedback`);
    if (!response.data) {
      throw new Error("Failed to fetch feedback");
    }
    return response.data;
  },

  getHolidaySchedules: async (): Promise<HolidaySchedule[]> => {
    const response = await api.get(`/holiday-schedule`);
    if (!response.data) {
      throw new Error("Failed to fetch holiday schedules");
    }
    return response.data;
  },
};