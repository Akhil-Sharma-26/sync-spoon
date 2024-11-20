import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Menu, MenuItem } from '../types';

const fetchMenu = async (): Promise<Menu> => {
  const response = await api.get<Menu>('/menu-today');
  return response.data;
};

const StudentDashboard: React.FC = () => {
  const { data: todayMenu, isLoading: isMenuLoading, error: menuError } = 
    useQuery<Menu, Error>({ queryKey: ['todayMenu'], queryFn: fetchMenu });

    const renderMealTable = (mealType: string, items: MenuItem[]) => {
      if (!items.length) return null;
    
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-300">{mealType}</h3>
          <table className="w-full border-collapse table-fixed"> {/* Add table-fixed class */}
            <thead>
              <tr className="bg-gray-700">
                <th className="border border-gray-600 p-2 text-left text-gray-300 w-1/3">Item</th> {/* Set width to 1/3 */}
                <th className="border border-gray-600 p-2 text-left text-gray-300 w-1/3">Category</th> {/* Set width to 1/3 */}
                <th className="border border-gray-600 p-2 text-left text-gray-300 w-1/3">Description</th> {/* Set width to 1/3 */}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700">
                  <td className="border border-gray-600 p-2 text-gray-300">{item.name}</td>
                  <td className="border border-gray-600 p-2 text-gray-300">{item.category}</td>
                  <td className="border border-gray-600 p-2 text-gray-300">{item.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

  return (
    <div className="p-6 bg-gray-900">
      <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-300">Today's Menu</h2>
        {isMenuLoading ? (
          <p className="text-gray-300">Loading menu...</p>
        ) : menuError ? (
          <p className="text-red-400">Error fetching menu: {menuError.message}</p>
        ) : todayMenu ? (
          <div>
            <p className="mb-4 text-gray-300">Date: {todayMenu.date}</p>
            {renderMealTable('Breakfast', todayMenu.breakfast)}
            {renderMealTable('Lunch', todayMenu.lunch)}
            {renderMealTable('Dinner', todayMenu.dinner)}
          </div>
        ) : (
          <p className="text-yellow-300">No menu available.</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;