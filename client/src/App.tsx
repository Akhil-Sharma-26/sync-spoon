import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoutes";
import RoleBasedNavigation from "./components/RoleBaseNavigation";
import { UserRole } from "./types";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import HeroPage from "./pages/HeroPage";
import RecordConsumption from "./components/RecordConsumption";
import SubmitFeedback from "./components/SubmitFeedback";
import Menu_all from "./components/Menu";
import AdminDashboard from "./pages/AdminDashboard";
import MessStaffDashboard from "./pages/MessStaffDashboard";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { useAuthMiddleware } from "./middleware/useAuthMiddleware";
import MenuSuggestions from "./components/MenuSuggestion";
import CsvUploader from "./components/CSVuploader";
import ReportGenerator from "./pages/ReportPage";
import UserManagement from "./pages/UserManagement";
import GenerateReports from "./components/GenerateReport";
import ShowMenuSuggested from "./components/ShowMenuSuggested";
import HolidayScheduleForm from "./components/HolidaySchedule";

// Create a separate component for the routes that need auth
const AuthenticatedRoutes: React.FC = () => {
  const { user, isLoading } = useAuthMiddleware();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <RoleBasedNavigation />
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
              allowedRoles={[
                UserRole.STUDENT,
                UserRole.ADMIN,
                UserRole.MESS_STAFF,
              ]}
            >
              {user?.role === UserRole.STUDENT ? (
                <StudentDashboard />
              ) : user?.role === UserRole.ADMIN ? (
                <AdminDashboard />
              ) : user?.role === UserRole.MESS_STAFF ? (
                <MessStaffDashboard />
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/record-consumption"
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.ADMIN, UserRole.MESS_STAFF]}
            >
              <RecordConsumption />
            </ProtectedRoute>
          }
        />

<Route
          path="/holiday-schedule"
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.ADMIN, UserRole.MESS_STAFF]}
            >
              <HolidayScheduleForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <SubmitFeedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/data-uploader"
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.ADMIN, UserRole.MESS_STAFF]}
            >
              <CsvUploader />
            </ProtectedRoute>
          }
        />

        <Route
          path="/see-menu"
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.ADMIN, UserRole.MESS_STAFF]}
            >
              <ShowMenuSuggested />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu-suggestion"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <MenuSuggestions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mess-staff"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate-report"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <ReportGenerator />
            </ProtectedRoute>
          }
        />

        <Route path="/testing" element={<ReportGenerator />} />
        {/* Redirect to unauthorized page for any other route */}
        <Route path="*" element={<UnauthorizedPage />} />
      </Routes>
    </>
  );
};

// Simplified App component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AuthenticatedRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
