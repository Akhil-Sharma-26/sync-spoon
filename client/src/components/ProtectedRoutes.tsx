import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthMiddleware } from '../middleware/useAuthMiddleware';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user } = useAuthMiddleware();

  if (!user) {
    // User is not logged in
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // User is logged in but does not have the required role
    return <Navigate to="/" replace />;
  }

  return children; // User is authenticated and has the required role
};

export default ProtectedRoute;