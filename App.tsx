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
import RegistrationForm from './pages/RegistrationForm';
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

// Enhanced ErrorBoundary to catch and display runtime errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('--- REACT CRASH ---', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-50 min-h-screen font-sans border-t-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Erreur de Rendu React</h1>
          <p className="text-red-600 mb-6">Un error es ocurrido al intentar mostrar esta página.</p>
          <div className="bg-white p-6 border rounded shadow-lg overflow-auto max-w-4xl">
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{this.state.error?.stack || this.state.error?.message}</pre>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-8 px-6 py-3 bg-red-800 text-white rounded font-bold uppercase tracking-widest hover:bg-red-900 transition-colors"
          >
            Retour a l'Accueil
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log('--- APP DEBUG ---', {
      isLoading,
      isAuthenticated: !!user,
      role: user?.role,
      windowPath: window.location.pathname,
      search: window.location.search
    });
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C0A76A]"></div>
          <p className="font-oswald text-[10px] uppercase tracking-[0.3em] text-gray-400 animate-pulse">Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage onNavigateToLogin={() => navigate('/login')} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/admin/login" element={<AdminLogin onBackToPortal={() => navigate('/')} />} />

      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute allowedRoles={['PARTENAIRE', 'ADMIN']}>
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
                <Route path="products" element={<AdminCatalog mode="all" />} />
                <Route path="collections" element={<AdminCatalog mode="collections" />} />
                <Route path="inventory" element={<AdminCatalog mode="inventory" />} />
                <Route path="catalog" element={<Navigate to="products" replace />} />
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
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;