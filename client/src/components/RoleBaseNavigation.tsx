import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authService, User } from "../services/authService";
import { UserRole } from "../types";

const RoleBasedNavigation: React.FC = () => {
  // Fetch the user profile
  const {
    data: user,
    isLoading,
    isError,
    refetch
  } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      // Check stored auth data
      const authDataString = localStorage.getItem('auth');
      
      if (!authDataString) return null;
      
      const authData = JSON.parse(authDataString);
      
      // Check if token is expired
      if (Date.now() > authData.expiresAt) {
        localStorage.removeItem('auth');
        return null;
      }
      
      try {
        // Validate token and get user profile
        const fetchedUser = await authService.getUserProfile();
        
        // Update stored user data if profile fetch is successful
        const updatedAuthData = {
          ...authData,
          user: fetchedUser
        };
        localStorage.setItem('auth', JSON.stringify(updatedAuthData));
        
        return fetchedUser;
      } catch (error) {
        // If token validation fails, clear storage
        localStorage.removeItem('auth');
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Optional: Manually refresh user data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => {
      // Clear localStorage
      localStorage.removeItem('auth');
      
      // Optional: Force page reload to reset application state
      window.location.reload();
      
      return Promise.resolve();
    },
  });

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
            onClick={() => logoutMutation.mutate()}
            className="bg-red-500 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;