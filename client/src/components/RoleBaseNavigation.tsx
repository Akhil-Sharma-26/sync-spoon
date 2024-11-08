import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const RoleBasedNavigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const renderNavLinks = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return (
          <>
            <Link to="/admin/dashboard" className="nav-link">Admin Dashboard</Link>
            <Link to="/mess-staff/dashboard" className="nav-link">Mess Staff Management</Link>
          </>
        );
      case UserRole.MESS_STAFF:
        return (
          <>
            <Link to="/mess-staff/dashboard" className="nav-link">Mess Staff Dashboard</Link>
            <Link to="/menu/manage" className="nav-link">Manage Menu</Link>
          </>
        );
      case UserRole.STUDENT:
        return (
          <>
            <Link to="/student/dashboard" className="nav-link">Student Dashboard</Link>
            <Link to="/menu" className="nav-link">Today's Menu</Link>
            <Link to="/feedback" className="nav-link">Provide Feedback</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          {renderNavLinks()}
        </div>
        <div className="flex items-center">
          {user && (
            <>
              <span className="mr-4">{user.name}</span>
              <button 
                onClick={logout} 
                className="bg-red-500 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;