import * as React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Order from './pages/Order';
import Academy from './pages/Academy';
import LandingPage from './pages/LandingPage';
import { useAuth } from './hooks/useAuth';

// Admin Components
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminPartners from './pages/AdminPartners';
import AdminPricing from './pages/AdminPricing';
import AdminOrders from './pages/AdminOrders';
import AdminCatalog from './pages/AdminCatalog';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';

// Simplified ErrorBoundary for build stability
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log('--- APP RENDER ---', {
      isLoading,
      isAuthenticated: !!user,
      role: user?.role,
      path: window.location.pathname
    });
  }, [isLoading, user]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage onNavigateToLogin={() => navigate('/login')} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin onBackToPortal={() => navigate('/')} />} />

      {/* Partner Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute allowedRoles={['PARTENAIRE']}>
            <Layout user={user as any} onLogout={logout} activePage="dashboard" onNavigate={() => { }}>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="order" element={<Order />} />
                <Route path="academy" element={<Academy user={user as any} />} />
                <Route path="*" element={<Navigate to="" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout
              onLogout={logout}
              activePage={window.location.pathname.split('/').pop() as any || 'dashboard'}
              onNavigate={(page) => navigate(`/admin/${page}`)}
            >
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="partners" element={<AdminPartners onNavigate={(page) => navigate(`/admin/${page}`)} />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="catalog" element={<AdminCatalog />} />
                <Route path="pricing" element={<AdminPricing />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;