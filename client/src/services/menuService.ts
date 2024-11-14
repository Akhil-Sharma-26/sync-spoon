// services/menuService.ts
import { Menu, GetTodayMenuFn } from '../types';
import api from './api';

export const menuService = {
  getTodayMenu: async (): Promise<Menu> => {
    const response = await api.get<Menu>('/menu/today');
    return response.data;
  },
};