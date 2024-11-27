import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LoginCredentials } from "../services/authService";
import { useAuthMiddleware } from "../middleware/useAuthMiddleware";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuthMiddleware();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Add effect to handle navigation after successful login
  useEffect(() => {
    if (user) {
      navigate('#/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginCredentials) => {
    setLoginError(null);
    setLoading(true);
    try {
      await login.mutateAsync(data);
      // Navigation will be handled by the useEffect above
    } catch (error: any) {
      setLoginError(
        error.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
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
            Login to Your Account
          </h2>

          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            >
              <span className="block sm:inline">{loginError}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Invalid email address",
                  },
                })}
                placeholder="Email"
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 
                  ${errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                placeholder="Password"
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 
                  ${errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>


          <button
            type="submit"
            disabled={login.status === "pending" || loading}
            className="w-full mt-6 bg-blue-500 text-white p-3 rounded-md 
              hover:bg-blue-600 transition-colors duration-300
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="#/register" className="text-blue-500 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;