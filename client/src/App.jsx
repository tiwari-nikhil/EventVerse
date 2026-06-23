import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';
import QRPassPage from './pages/events/QRPassPage';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import PortfolioPage from './pages/student/PortfolioPage';
import MyRegistrationsPage from './pages/student/MyRegistrationsPage';

// Organizer
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEventPage from './pages/organizer/CreateEventPage';
import EditEventPage from './pages/organizer/EditEventPage';
import AttendanceScannerPage from './pages/organizer/AttendanceScannerPage';
import EventAnalyticsPage from './pages/organizer/EventAnalyticsPage';
import OrganizerRequestPage from './pages/organizer/OrganizerRequestPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrgRequestsPage from './pages/admin/AdminOrgRequestsPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.some((r) => user?.roles?.includes(r))) {
    return <Navigate to="/events" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#4ade80', secondary: '#0f0f1a' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#0f0f1a' } },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />

        {/* QR pass - student */}
        <Route path="/registrations/:id/qr" element={<ProtectedRoute><QRPassPage /></ProtectedRoute>} />

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute roles={['student']}><DashboardLayout role="student" /></ProtectedRoute>}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="registrations" element={<MyRegistrationsPage />} />
        </Route>

        {/* Organizer */}
        <Route path="/organizer" element={<ProtectedRoute roles={['organizer']}><DashboardLayout role="organizer" /></ProtectedRoute>}>
          <Route path="dashboard" element={<OrganizerDashboard />} />
          <Route path="events/new" element={<CreateEventPage />} />
          <Route path="events/:id/edit" element={<EditEventPage />} />
          <Route path="events/:id/scan" element={<AttendanceScannerPage />} />
          <Route path="events/:id/analytics" element={<EventAnalyticsPage />} />
        </Route>

        {/* Organizer request (for students wanting to become organizer) */}
        <Route path="/become-organizer" element={<ProtectedRoute><OrganizerRequestPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="organizer-requests" element={<AdminOrgRequestsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
