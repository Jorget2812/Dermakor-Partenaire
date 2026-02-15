import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Language, User } from '../types';
import { LayoutDashboard, ShoppingBag, GraduationCap, LogOut, Globe, UserCheck, ShieldCheck, EyeOff, Menu, ChevronLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, user, onLogout }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isSimulatingPartner, toggleSimulation } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    return localStorage.getItem('derma_sidebar_collapsed_user') === 'true';
  });

  const handleExitSimulation = async () => {
    await toggleSimulation();
    navigate('/admin/dashboard');
  };

  const toggleSidebar = () => {
    const newValue = !isSidebarCollapsed;
    setIsSidebarCollapsed(newValue);
    localStorage.setItem('derma_sidebar_collapsed_user', String(newValue));
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F9F7] relative overflow-hidden">
        {/* Background Texture/Shape */}
        <div className="absolute top-0 left-0 w-full h-2 bg-derma-gold"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-derma-goldLight rounded-full opacity-20 blur-3xl"></div>

        <div className="absolute top-8 right-8 flex gap-4 text-xs font-medium tracking-widest text-derma-charcoal">
          {(['FR', 'DE', 'IT'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`transition-all duration-300 ${language === lang ? 'text-derma-black border-b border-derma-gold' : 'text-gray-400 hover:text-derma-charcoal'}`}
            >
              {lang}
            </button>
          ))}
        </div>

        {children}
      </div>
    )
  }

  const NavItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => onNavigate(id)}
      className={`w-full flex items-center gap-4 px-6 py-4 text-sm tracking-wide transition-all duration-300 border-l-2
        ${activePage === id
          ? 'border-derma-gold bg-white text-derma-black font-medium shadow-sm'
          : 'border-transparent text-gray-500 hover:text-derma-charcoal hover:bg-gray-50'}`}
    >
      <Icon size={18} strokeWidth={1.5} />
      {!isSidebarCollapsed && (
        <span className="animate-in fade-in slide-in-from-left-2 duration-300">{label}</span>
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-derma-border flex flex-col fixed h-full z-10 hidden md:flex transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className={`p-8 relative ${isSidebarCollapsed ? 'px-4 pb-8' : 'pb-12'}`}>
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-10 bg-white border border-derma-border rounded-full p-1 shadow-sm hover:text-derma-gold transition-colors z-30"
          >
            {isSidebarCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
          </button>

          <h1 className={`font-serif text-derma-black tracking-tight transition-all duration-300 ${isSidebarCollapsed ? 'text-sm text-center' : 'text-2xl'}`}>
            DERMAKOR <span className="text-derma-gold">{isSidebarCollapsed ? 'S' : 'SWISS'}</span>
          </h1>
          {!isSidebarCollapsed && (
            <p className="text-[10px] uppercase tracking-[0.1em] text-derma-text-muted mt-2 font-black leading-tight">
              Distributeur Officiel & Exclusif <br />
              <span className="text-derma-gold">KRX Aesthetics</span>
            </p>
          )}
        </div>

        <nav className={`flex-1 flex flex-col gap-1 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <NavItem id="dashboard" label={t('nav_dashboard')} icon={LayoutDashboard} />
          <NavItem id="order" label={t('nav_order')} icon={ShoppingBag} />
          <NavItem id="academy" label={t('nav_academy')} icon={GraduationCap} />
        </nav>

        <div className={`p-6 border-t border-derma-border bg-derma-cream/30 transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : ''}`}>
          {!isSidebarCollapsed && (
            <div className="mb-6">
              <p className="text-[10px] text-derma-text-muted uppercase tracking-widest mb-3 font-bold">{t('dash_welcome')}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-derma-gold/10 text-derma-gold flex items-center justify-center text-xs font-serif border border-derma-gold/20">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-derma-black truncate w-40">{user.instituteName || 'Mon Institut'}</span>
                  <div className="flex items-center gap-1 text-[9px] text-derma-gold font-bold uppercase tracking-wider">
                    <ShieldCheck size={10} />
                    {user.tier.replace('PREMIUM_', '')}
                  </div>
                </div>
              </div>
            </div>
          )}
          {isSimulatingPartner && (
            <button
              onClick={handleExitSimulation}
              className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 bg-derma-gold/10 border border-derma-gold/30 rounded-sm text-derma-gold text-[10px] uppercase font-bold tracking-[2px] hover:bg-derma-gold hover:text-white transition-all duration-300 shadow-sm"
            >
              <EyeOff size={14} /> Quitter Partner View
            </button>
          )}
          <div className={`flex justify-between items-center pt-4 border-t border-derma-border ${isSidebarCollapsed ? 'flex-col gap-2' : ''}`}>
            {!isSidebarCollapsed && (
              <div className="flex gap-3 text-[10px] font-bold text-derma-text-muted">
                {(['FR', 'DE', 'IT'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`transition-colors ${language === lang ? 'text-derma-black border-b border-derma-gold' : 'hover:text-derma-blue-executive'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
            <button onClick={onLogout} className="text-derma-text-muted hover:text-derma-black transition-colors" title={t('nav_logout')}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'} bg-white overflow-y-auto min-h-screen transition-all duration-300 ease-in-out`}>
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
