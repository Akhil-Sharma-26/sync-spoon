import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthMiddleware } from '../middleware/useAuthMiddleware';
import { RegisterCredentials } from '../services/authService';
import { UserRole } from '../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerMutation, user } = useAuthMiddleware();
  
  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    reset 
  } = useForm<RegisterCredentials>();

  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const onSubmit = async (data: RegisterCredentials) => {
    setRegistrationError(null);
    
    try {
      // Attempt registration
      await registerMutation.mutateAsync(data);
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Reset form
      reset();
    } catch (error: any) {
      // Handle registration error
      setRegistrationError(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/'); // Navigate to home or dashboard
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Create Your Account
          </h2>

          {/* Registration Error Display */}
          {registrationError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            >
              <span className="block sm:inline">{registrationError}</span>
            </motion.div>
          )}

          {/* Name Input */}
          <div className="mb-4">
            <input
              type="text"
              {...register('name', { 
                required: 'Full Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
              })}
              placeholder="Full Name"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 
                ${errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'}`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Invalid email address'
                }
              })}
              placeholder="Email"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 
                ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'}`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <input
              type="password"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                validate: (value) => {
                  const hasUpperCase = /[A-Z]/.test(value);
                  const hasLowerCase = /[a-z]/.test(value);
                  const hasNumber = /[0-9]/.test(value);
                  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
                  
                  return (
                    (hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) || 
                    'Password must include uppercase, lowercase, number, and special character'
                  );
                }
              })}
              placeholder="Password"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 
                ${errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'}`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          
          {/* Role Selection */}
          <div className="mb-4">
            <select
              {...register('role', { required: 'Role is required' })}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 
                ${errors.role ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'}`}
            >
              <option value="">Select a Role</option>
              {Object.values(UserRole).map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={registerMutation.status === 'pending'}
            className={`w-full p-3 rounded-md text-white transition-colors duration-300 
              ${registerMutation.status === 'pending' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
              }`}
          >
            {registerMutation.status === 'pending' ? 'Registering...' : 'Register'}
          </button>
        </form>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-8 rounded-lg text-center max-w-sm w-full"
            >
              <div className="mb-4 text-green-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 mx-auto" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Registration Successful!</h3>
              <p className="mt-2 text-gray-600">You have successfully registered. You will be redirected shortly.</p>
              <button 
                onClick={handleSuccessModalClose} 
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300"
              >
                Go to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;