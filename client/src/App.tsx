import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route,
  Navigate 
} from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import ProtectedRoute from './components/ProtectedRoutes';
import RoleBasedNavigation from './components/RoleBaseNavigation';
import { UserRole } from './types';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import HeroPage from './pages/HeroPage';
import { useAuthMiddleware } from './middleware/useAuthMiddleware';
// import AdminDashboard from './pages/AdminDashboard';
// import MessStaffDashboard from './pages/MessStaffDashboard';

// Update ProtectedRoute component to use React.ReactElement
const ProtectedRouteWrapper: React.FC<{
  element: React.ReactElement;
  allowedRoles?: UserRole[];
}> = ({ element, allowedRoles }) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      {element}
    </ProtectedRoute>
  );
};

const App: React.FC = () => {
  const {user} = useAuthMiddleware();
  return (
    <AuthProvider>
      <Router>
        <RoleBasedNavigation />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path='/' element={<HeroPage/>} />
          {/* Protected Routes */}
          <Route 

          path="/student/dashboard" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <StudentDashboard />
            </ProtectedRoute>
          } 

        />
          {/* <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRouteWrapper 
                element={<AdminDashboard />} 
                allowedRoles={[UserRole.ADMIN]} 
              />
            } 
          />
          <Route 
            path="/mess-staff/dashboard" 
            element={
              <ProtectedRouteWrapper 
                element={<MessStaffDashboard />} 
                allowedRoles={[UserRole.MESS_STAFF]} 
              />
            } 
          /> */}

          {/* Redirect to login for any other route */}
          <Route
          path="*" 
          element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} 
        />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;