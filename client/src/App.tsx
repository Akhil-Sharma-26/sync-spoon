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
import RecordConsumption from './components/RecordConsumption';
import SubmitFeedback from './components/SubmitFeedback';
import HolidayScheduleForm from './components/HolidaySchedule';
import Menu_all from './components/Menu';
import AdminDashboard from './pages/AdminDashboard';
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
          <Route path="/menu" element={<Menu_all />} />
          {/* Protected Routes */}
            <Route 
            path="/dashboard" 
            element={
              <ProtectedRouteWrapper 
              element={
                user?.role === UserRole.STUDENT ? <StudentDashboard /> :
                user?.role === UserRole.ADMIN ? <AdminDashboard /> :
                // user?.role === UserRole.MESS_STAFF ? <MessStaffDashboard /> :
                <Navigate to="/" replace />
              } 
              allowedRoles={[UserRole.STUDENT, UserRole.ADMIN, UserRole.MESS_STAFF]} 
              />
            } 
            />

            <Route path='/record-consumption' element={
              <ProtectedRouteWrapper 
              element={<RecordConsumption/>} 
              allowedRoles={[UserRole.ADMIN, UserRole.MESS_STAFF]}
              />
            }/>


            <Route path='/feedback' element={
              <ProtectedRouteWrapper 
              element={<SubmitFeedback/>} 
              allowedRoles={[UserRole.STUDENT]}
              />
            }/>

          {/* Redirect to login for any other route */}
          <Route
          path="*" 
        element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} 
        />



        <Route path='/testing' element={<HolidayScheduleForm/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;