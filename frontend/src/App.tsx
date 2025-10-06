import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { PageLoader } from './components/LoadingSpinner';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportPage } from './pages/ReportPage';
import { UserGuidePage } from './pages/UserGuidePage';
import Footer from './components/Footer';
import ResetPassword from './pages/ResetPassword';
import { Toaster } from 'sonner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path='/userguide' element={<UserGuidePage />} />
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/report" element={
        <ProtectedRoute>
          <ReportPage />
        </ProtectedRoute>
      } />
      <Route path="/guide" element={
        <ProtectedRoute>
          <UserGuidePage />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-background pt-0 min-h-screen pb-14">
          <Toaster position='top-right' richColors />
          <AppRoutes />
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;