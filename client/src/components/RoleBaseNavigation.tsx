import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { UserRole } from "../types";
import { useAuthMiddleware } from "../middleware/useAuthMiddleware";

const RoleBasedNavigation: React.FC = () => {
  const { 
    user, 
    logout, 
    isLoading, 
    isError 
  } = useAuthMiddleware();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading user data.</div>;

  // Unauthenticated navbar
  if (!user) {
    return (
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <Link to="/" className="nav-link">
              Home
            </Link>

            <Link to="/menu" className="nav-link">
              Menu
            </Link>
          </div>

          <div className="flex items-center">
            <Link to="/login" className="bg-blue-500 px-4 py-2 rounded mr-2">
              Login
            </Link>

            <Link to="/register" className="bg-green-500 px-4 py-2 rounded">
              Register
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Role-based navigation rendering
  const renderNavLinks = () => {
    switch (user.role) {
      case UserRole.ADMIN:
        return (
          <>
            <Link to="/admin/dashboard" className="nav-link">
              Admin Dashboard
            </Link>
            <Link to="/mess-staff/dashboard" className="nav-link">
              Mess Staff Management
            </Link>
          </>
        );
      case UserRole.MESS_STAFF:
        return (
          <>
            <Link to="/mess-staff/dashboard" className="nav-link">
              Mess Staff Dashboard
            </Link>
            <Link to="/menu/manage" className="nav-link">
              Manage Menu
            </Link>
          </>
        );
      case UserRole.STUDENT:
        return (
          <>
            <Link to="/student/dashboard" className="nav-link">
              Student Dashboard
            </Link>
            <Link to="/menu" className="nav-link">
              Today's Menu
            </Link>
            <Link to="/feedback" className="nav-link">
              Provide Feedback
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">{renderNavLinks()}</div>
        <div className="flex items-center">
          <span className="mr-4">{user.name}</span>
          <button
            onClick={() => logout.mutate()}
            className="bg-red-500 px-4 py-2 rounded"
            disabled={logout.status === 'pending'}
          >
            {logout.status === 'pending' ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;