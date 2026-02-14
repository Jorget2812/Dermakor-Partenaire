import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Order from './pages/Order';
import Academy from './pages/Academy';
import LandingPage from './pages/LandingPage';
import { User, UserTier, AdminPage } from './types';
import { MOCK_USER } from './constants';

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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  
  // App State: 'LANDING' | 'PORTAL'
  const [appView, setAppView] = useState<'LANDING' | 'PORTAL'>('LANDING');

  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activeAdminPage, setActiveAdminPage] = useState<AdminPage>('dashboard');

  // --- PARTNER HANDLERS ---
  const handleLogin = () => {
    setUser(MOCK_USER);
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage('dashboard');
    setAppView('LANDING'); // Go back to landing on logout
  };

  const renderPartnerPage = () => {
    switch (activePage) {
      case 'dashboard':
        return user ? <Dashboard user={user} onNavigate={setActivePage} /> : null;
      case 'order':
        return user ? <Order /> : null;
      case 'academy':
        return user ? <Academy user={user} /> : null;
      default:
        return user ? <Dashboard user={user} onNavigate={setActivePage} /> : null;
    }
  };

  // --- ADMIN HANDLERS ---
  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminMode(false);
    setActiveAdminPage('dashboard');
    setAppView('PORTAL'); // Return to portal login view
  };

  const renderAdminPage = () => {
    switch (activeAdminPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'partners':
        return <AdminPartners onNavigate={setActiveAdminPage} />;
      case 'orders':
        return <AdminOrders />;
      case 'catalog':
          return <AdminCatalog />;
      case 'pricing':
          return <AdminPricing />;
      case 'reports':
          return <AdminReports />;
      case 'settings':
          return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <LanguageProvider>
      
      {appView === 'LANDING' ? (
        <LandingPage onNavigateToLogin={() => setAppView('PORTAL')} />
      ) : (
        /* PORTAL & ADMIN LOGIC */
        isAdminMode ? (
          // ADMIN FLOW
          !isAdminLoggedIn ? (
            <AdminLogin 
              onLogin={handleAdminLogin} 
              onBackToPortal={() => setIsAdminMode(false)}
            />
          ) : (
            <AdminLayout
              activePage={activeAdminPage}
              onNavigate={setActiveAdminPage}
              onLogout={handleAdminLogout}
            >
              {renderAdminPage()}
            </AdminLayout>
          )
        ) : (
          // PARTNER FLOW
          <Layout 
            activePage={activePage} 
            onNavigate={setActivePage} 
            user={user}
            onLogout={handleLogout}
          >
            {!user ? (
              <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
                 <div className="w-full mb-4 px-8">
                    <button 
                      onClick={() => setAppView('LANDING')}
                      className="text-xs text-gray-400 hover:text-derma-black flex items-center gap-1 uppercase tracking-wider"
                    >
                      ← Retour au site
                    </button>
                 </div>
                 <Login onLogin={handleLogin} />
                 
                 {/* Secret Admin Entry */}
                 <div className="mt-8 pt-8 border-t border-gray-100 w-full max-w-md text-center">
                    <button 
                      onClick={() => setIsAdminMode(true)}
                      className="text-[10px] text-gray-300 hover:text-derma-gold uppercase tracking-widest transition-colors"
                    >
                      Admin Access
                    </button>
                 </div>
              </div>
            ) : (
              renderPartnerPage()
            )}
          </Layout>
        )
      )}

    </LanguageProvider>
  );
};

export default App;