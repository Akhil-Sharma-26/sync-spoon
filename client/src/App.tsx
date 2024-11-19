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
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import HeroPage from './pages/HeroPage';
import { useAuthMiddleware } from './middleware/useAuthMiddleware';
import RecordConsumption from './components/RecordConsumption';
import SubmitFeedback from './components/SubmitFeedback';
import HolidayScheduleForm from './components/HolidaySchedule';
import Menu_all from './components/Menu';
import AdminDashboard from './pages/AdminDashboard';
import MessStaffDashboard from './pages/MessStaffDashboard';
import CsvUploader from './components/CSVuploader';

const App: React.FC = () => {
  const { user } = useAuthMiddleware();

  return (
    <AuthProvider>
      <Router>
        {user && <RoleBasedNavigation />}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HeroPage />} />
          <Route path="/menu" element={<Menu_all />} />
          
          {/* Protected Routes */}
          <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute 
              allowedRoles={[UserRole.STUDENT, UserRole.ADMIN, UserRole.MESS_STAFF]}
            >
              {user?.role === UserRole.STUDENT ? <StudentDashboard /> :
              user?.role === UserRole.ADMIN ? <AdminDashboard /> :
              user?.role === UserRole.MESS_STAFF ? <MessStaffDashboard /> :
              <Navigate to="/login" replace />}
            </ProtectedRoute>
          } 
          />
          
          <Route path='/record-consumption' element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MESS_STAFF]}>
              <RecordConsumption />
            </ProtectedRoute>
          } />

          <Route path='/feedback' element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <SubmitFeedback />
            </ProtectedRoute>
          } />

          <Route path='/testing' element={<CsvUploader />} />

          {/* Redirect to login for any other route */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;