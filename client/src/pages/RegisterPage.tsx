import React from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RegisterCredentials } from "../services/authService";
import { UserRole } from "../types";
import { useAuthMiddleware } from "../middleware/useAuthMiddleware";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

const errorAnimation = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const LoadingSpinner = () => (
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
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const FormInput: React.FC<{
  type: string;
  error?: string;
  register: any;
  name: string;
  placeholder: string;
  validation: object;
}> = ({ type, error, register, name, placeholder, validation }) => (
  <div>
    <input
      type={type}
      {...register(name, validation)}
      placeholder={placeholder}
      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 
        ${error ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export const RegisterPage: React.FC = () => {
  const { register: registerMutation, user, isAuthenticated } = useAuthMiddleware();
  
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCredentials>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      // Add default role 'STUDENT' to the data
      const payload = {
        ...data,
        role: 'STUDENT' as UserRole, // Adding the default role
      };
      await registerMutation.mutateAsync(payload);
      // Navigation will be handled by the auth middleware
    } catch (error: unknown) {
      console.error("Registration error:", error);
    }
  };

  const validations = {
    name: {
      required: "Full name is required",
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /\S+@\S+\.\S+/,
        message: "Invalid email address",
      },
    },
    password: {
      required: "Password is required",
      minLength: {
        value: 8,
        message: "Password must be at least 8 characters",
      },
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        {...fadeIn}
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

          <AnimatePresence>
            {registerMutation.error && (
              <motion.div
                {...errorAnimation}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              >
                <span className="block sm:inline">
                  {registerMutation.error instanceof Error 
                    ? registerMutation.error.message 
                    : 'Registration failed. Please try again.'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <FormInput
              type="text"
              error={errors.name?.message}
              register={formRegister}
              name="name"
              placeholder="Full Name"
              validation={validations.name}
            />

            <FormInput
              type="email"
              error={errors.email?.message}
              register={formRegister}
              name="email"
              placeholder="Email"
              validation={validations.email}
            />

            <FormInput
              type="password"
              error={errors.password?.message}
              register={formRegister}
              name="password"
              placeholder="Password"
              validation={validations.password}
            />

            <div className="text-sm text-gray-600">
              Password must:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Be at least 8 characters long</li>
                <li>Include an uppercase letter</li>
                <li>Include a lowercase letter</li>
                <li>Include a number</li>
                <li>Include a special character (@$!%*?&)</li>
              </ul>
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full mt-6 bg-blue-500 text-white p-3 rounded-md 
              hover:bg-blue-600 transition-colors duration-300
              disabled:opacity-50 disabled:cursor-not-allowed 
              flex items-center justify-center"
          >
            {registerMutation.isPending ? (
              <>
                <LoadingSpinner />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;