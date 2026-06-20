import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import CollegeDashboard from './pages/CollegeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PortfolioPage from './pages/PortfolioPage';
import PrivacyPolicy from './pages/PrivacyPolicy';

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <LandingPage />;
  const PATHS = { STUDENT: '/student', COMPANY: '/company', COLLEGE_ADMIN: '/college', ADMIN: '/admin' };
  return <Navigate to={PATHS[user?.role] || '/login'} replace />;
}

function ResponsiveToaster() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Toaster
      position={isMobile ? "bottom-center" : "bottom-right"}
      toastOptions={{
        style: {
          background: '#ffffff',
          color: '#111827',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '16px',
        },
        duration: 4000,
      }}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ResponsiveToaster />
        <ErrorBoundary>
          <Routes>
            {/* Public */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student */}
            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />

            {/* Company */}
            <Route path="/company/*" element={
              <ProtectedRoute allowedRoles={['COMPANY']}>
                <CompanyDashboard />
              </ProtectedRoute>
            } />

            {/* College */}
            <Route path="/college/*" element={
              <ProtectedRoute allowedRoles={['COLLEGE_ADMIN']}>
                <CollegeDashboard />
              </ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />


            {/* Public Portfolio */}
            <Route path="/portfolio/:studentId" element={<PortfolioPage />} />
            
            {/* Privacy Policy */}
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Unauthorized */}
            <Route path="/unauthorized" element={
              <div className="min-h-screen bg-surface-100 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl mb-4">🚫</p>
                  <h2 className="text-2xl font-bold text-text-heading mb-2">Access Denied</h2>
                  <p className="text-text-muted">You don't have permission to view this page.</p>
                </div>
              </div>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
