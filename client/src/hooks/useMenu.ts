// hooks/useMenu.ts
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Menu } from '../types';

export const useMenu = () => {
  return useQuery<Menu, Error>({
    queryKey: ['todayMenu'],
    queryFn: async () => {
      const response = await api.get('/api/menu');
      console.log(response);
      if (!response.data || !response.data.items) {
        throw new Error('Invalid menu data received');
      }
      return response.data;
    },
  });
};