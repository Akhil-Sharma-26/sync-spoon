import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserRole } from "../types";
import { useAuthMiddleware } from "../middleware/useAuthMiddleware";

const RoleBasedNavigation: React.FC = () => {
  const { user, logout, isLoading, isError } = useAuthMiddleware();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link to="/dashboard" className="nav-link">
              Admin Dashboard
            </Link>
            <Link to="/mess-staff" className="nav-link">
              Mess Staff Management
            </Link>
            <Link to="/data-uploader" className="nav-link">
              Data Uploader
            </Link>
            <Link to="/menu-suggestion" className="nav-link">
              Menu Suggestions
            </Link>
            <Link to="/generate-report" className="nav-link">
              Generate Report
            </Link>
          </>
        );
      case UserRole.MESS_STAFF:
        return (
          <>
            <Link to="/dashboard" className="nav-link">
              Mess Staff Dashboard
            </Link>
            <Link to="/see-menu" className="nav-link">
              Manage Menu
            </Link>
            <Link to="/data-uploader" className="nav-link">
              Data Uploader
            </Link>
          </>
        );
      case UserRole.STUDENT:
        return (
          <>
            <Link to="/dashboard" className="nav-link">
              Student Dashboard
            </Link>
            <Link to="/menu" className="nav-link">
              Menu
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
        <div className="flex items-center">
          <button
            className="text-white md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          <div className={`hidden md:flex space-x-4 md:space-x-6`}>
            {renderNavLinks()}
          </div>
        </div>
        <div className="flex items-center">
          <span className="mr-4">{user.name}</span>
          <button
            onClick={() => logout.mutate()}
            className="bg-red-500 px-4 py-2 rounded"
            disabled={logout.status === "pending"}
          >
            {logout.status === "pending" ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-gray-700 md:hidden">
          <div className="flex flex-col space-y-2 p-4">
            { renderNavLinks()}
            <div className="flex flex-col space-y-2">
              <span className="mr-4">{user.name}</span>
              <button
                onClick={() => logout.mutate()}
                className="bg-red-500 px-4 py-2 rounded"
                disabled={logout.status === "pending"}
              >
                {logout.status === "pending" ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default RoleBasedNavigation;