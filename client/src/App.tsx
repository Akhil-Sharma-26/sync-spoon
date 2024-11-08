import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route 
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoutes';
import LoginPage from './pages/LoginPage';
import { UserRole } from './types';

// Dashboard components
// import AdminDashboard from './pages/AdminDashboard';
// import MessStaffDashboard from './pages/MessStaffDashboard';
import StudentDashboard from './pages/StudentDashboard';
import UnauthorizedPage from './pages/UnauthorizedPage';
import RegisterPage from './pages/RegisterPage';
// import UnauthorizedPage from './pages/UnauthorizedPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[UserRole.MESS_STAFF, UserRole.ADMIN]} />}>
            {/* <Route path="/mess-staff/dashboard" element={<MessStaffDashboard />} /> */}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;