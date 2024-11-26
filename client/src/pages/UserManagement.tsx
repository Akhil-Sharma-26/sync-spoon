import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import api from '../services/api';
import { 
  FaUserPlus, 
  FaTrash, 
  FaFilter, 
  FaUserCog,
  FaSpinner 
} from 'react-icons/fa';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [newUser , setNewUser ] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as UserRole
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/users', {
        params: { role: selectedRole || undefined }
      });

      // Check if the response is structured correctly
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
      } else {
        setUsers([]); // Set to empty array if response is not as expected
        setError('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching users', error);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser  = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    try {
      await api.post('/users', newUser );
      await fetchUsers();
      // Reset form
      setNewUser ({
        name: '',
        email: '',
        password: '',
        role: '' as UserRole
      });
    } catch (error) {
      console.error('Error creating user', error);
      setError('Failed to create user. Please check your inputs.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser  = async (id: number) => {
    setError(null);
    try {
      await api.delete(`/users/${id}`);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user', error);
      setError('Failed to delete user. Some records depend on this user.');
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={4} className="text-center py-4">
            <div className="flex justify-center items-center">
              <FaSpinner className="animate-spin mr-2" />
              <span>Loading users...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (users.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="text-center py-4">
            No users found
          </td>
        </tr>
      );
    }

    return users.map(user => (
      <tr key={user.id} className="hover:bg-gray-50 transition duration-150">
        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`
            px-2 inline-flex text-xs leading-5 font-semibold rounded-full
            ${user.role === UserRole.ADMIN ? 'bg-green-100 text-green-800' : 
              user.role === UserRole.MESS_STAFF ? 'bg-yellow-100 text-yellow-800' : 
              'bg-blue-100 text-blue-800'}
          `}>
            {user.role}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <button 
            onClick={() => handleDeleteUser (user.id)}
            className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
            disabled={isLoading}
          >
            <FaTrash />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaUserCog className="mr-3 text-blue-600" />
            User Management
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* User Filter and List */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Filter Section */}
          <div className="bg-gray-100 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaFilter className="text-gray-500" />
              <select 
                className="form-select block w-full sm:w-64 border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
                disabled={isLoading}
              >
                <option value="">All Users</option>
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderTableContent()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Form */}
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <FaUserPlus className="mr-3 text-blue-600" />
            Create New User
          </h2>
          <form onSubmit={handleCreateUser } className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                value={newUser .name} 
                onChange={(e) => setNewUser ({ ...newUser , name: e.target.value })} 
                required 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                value={newUser .email} 
                onChange={(e) => setNewUser ({ ...newUser , email: e.target.value })} 
                required 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                value=
                {newUser .password} 
                onChange={(e) => setNewUser ({ ...newUser , password: e.target.value })} 
                required 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select 
                value={newUser .role} 
                onChange={(e) => setNewUser ({ ...newUser , role: e.target.value as UserRole })} 
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Role</option>
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-150"
              disabled={isCreating}
            >
              {isCreating ? (
                <div className="flex justify-center items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Creating...
                </div>
              ) : (
                'Create User'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;