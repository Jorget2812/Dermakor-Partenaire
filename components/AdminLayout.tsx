import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  Search,
  Tag,
  Globe
} from 'lucide-react';
import { AdminPage, Language } from '../types';
import NotificationCenter from './NotificationCenter';
import { useLanguage } from '../context/LanguageContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activePage, onNavigate, onLogout }) => {
  const { language, setLanguage, t } = useLanguage();

  const NavItem = ({ id, labelKey, icon: Icon, count }: { id: AdminPage, labelKey: string, icon: any, count?: number }) => {
    const isActive = activePage === id;
    const label = t(labelKey as any);
    return (
      <button
        onClick={() => onNavigate(id)}
        className={`w-full flex items-center gap-3 px-6 py-3.5 text-[13px] transition-luxury relative group
          ${isActive
            ? 'text-derma-blue bg-white shadow-sm border-r-4 border-derma-gold'
            : 'text-derma-text-muted hover:text-derma-blue hover:bg-white/50'
          }`}
      >
        <Icon size={18} className={isActive ? 'text-derma-gold' : 'text-derma-text-muted group-hover:text-derma-blue'} />
        <span className={`font-semibold tracking-[0.02em] ${isActive ? 'text-derma-text' : ''}`}>{label}</span>
        {count !== undefined && (
          <span className="ml-auto text-[10px] font-bold bg-derma-blue text-white px-2 py-0.5 rounded-full shadow-sm">
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-derma-bg flex font-sans">

      {/* SIDEBAR - Clinical Light Theme */}
      <aside className="w-[280px] bg-derma-bg flex-shrink-0 fixed h-full z-20 flex flex-col border-r border-derma-border">
        {/* Header */}
        <div className="p-10 pb-8">
          <h1 className="font-oswald text-derma-text text-xl tracking-[0.2em] uppercase">
            DermaKor <span className="text-derma-gold">Swiss</span>
          </h1>
          <p className="text-[9px] text-derma-text-muted uppercase font-bold tracking-[0.2em] mt-1.5 opacity-70">Medical Distribution</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem id="dashboard" labelKey="admin_nav_dashboard" icon={LayoutDashboard} />

          <div className="pt-8 pb-3 px-8">
            <p className="text-[10px] uppercase text-derma-text-muted font-black tracking-[0.25em] opacity-40">{t('admin_nav_operational')}</p>
          </div>
          <NavItem id="partners" labelKey="admin_nav_partners" icon={Users} count={24} />
          <NavItem id="orders" labelKey="admin_nav_orders" icon={ShoppingBag} count={12} />

          <div className="space-y-1">
            <NavItem id="products" labelKey="admin_nav_products" icon={Package} />
            <div className={`overflow-hidden transition-all duration-300 ${(activePage === 'products' || activePage === 'collections' || activePage === 'inventory') ? 'max-h-40' : 'max-h-0'}`}>
              <button
                onClick={() => onNavigate('products')}
                className={`w-full flex items-center gap-3 pl-14 py-2.5 text-[12px] transition-luxury relative group
                  ${activePage === 'products' ? 'text-derma-blue font-bold' : 'text-derma-text-muted hover:text-derma-blue'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${activePage === 'products' ? 'bg-derma-gold' : 'bg-transparent border border-derma-border'}`}></div>
                <span>{t('admin_nav_products')}</span>
              </button>
              <button
                onClick={() => onNavigate('collections')}
                className={`w-full flex items-center gap-3 pl-14 py-2.5 text-[12px] transition-luxury relative group
                  ${activePage === 'collections' ? 'text-derma-blue font-bold' : 'text-derma-text-muted hover:text-derma-blue'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${activePage === 'collections' ? 'bg-derma-gold' : 'bg-transparent border border-derma-border'}`}></div>
                <span>{t('admin_nav_collections')}</span>
              </button>
              <button
                onClick={() => onNavigate('inventory')}
                className={`w-full flex items-center gap-3 pl-14 py-2.5 text-[12px] transition-luxury relative group
                  ${activePage === 'inventory' ? 'text-derma-blue font-bold' : 'text-derma-text-muted hover:text-derma-blue'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${activePage === 'inventory' ? 'bg-derma-gold' : 'bg-transparent border border-derma-border'}`}></div>
                <span>{t('admin_nav_inventory')}</span>
              </button>
            </div>
          </div>

          <div className="pt-8 pb-3 px-8">
            <p className="text-[10px] uppercase text-derma-text-muted font-black tracking-[0.25em] opacity-40">{t('admin_nav_strategy')}</p>
          </div>
          <NavItem id="pricing" labelKey="admin_nav_pricing" icon={Tag} />
          <NavItem id="reports" labelKey="admin_nav_reports" icon={BarChart2} />
          <NavItem id="settings" labelKey="admin_nav_settings" icon={Settings} />
        </nav>

        {/* User Footer */}
        <div className="p-8 border-t border-derma-border bg-white/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-derma-blue text-white flex items-center justify-center font-bold font-oswald text-sm shadow-md">
              JT
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-derma-text truncate tracking-tight">Jorge Torres</p>
              <p className="text-[10px] text-derma-text-muted truncate uppercase font-bold opacity-60">Directeur Général</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-derma-border rounded-md text-derma-text-muted text-[11px] font-bold uppercase tracking-widest hover:text-derma-blue hover:border-derma-blue hover:shadow-clinical transition-luxury"
          >
            <LogOut size={14} /> {t('admin_logout')}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-[280px] flex flex-col min-h-screen">

        {/* TOP HEADER BAR - Clean & Minimalist */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-derma-border sticky top-0 z-40 px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-derma-gold rounded-full mr-2"></div>
            <h2 className="font-oswald text-2xl text-derma-text uppercase tracking-widest">
              {activePage === 'pricing' ? t('admin_nav_pricing') : t(`admin_nav_${activePage}` as any)}
            </h2>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative group hidden lg:block">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-derma-text-muted group-focus-within:text-derma-blue transition-colors" />
              <input
                type="text"
                placeholder={t('admin_search_placeholder')}
                className="pl-12 pr-6 py-2.5 bg-derma-bg border border-transparent rounded-full text-[11px] font-bold tracking-widest text-derma-text focus:outline-none focus:bg-white focus:border-derma-blue w-72 transition-luxury"
              />
            </div>

            <div className="flex items-center gap-5">
              {/* Language Switcher */}
              <div className="flex bg-derma-bg p-1 rounded-full border border-derma-border">
                {(['FR', 'DE', 'IT'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${language === lang ? 'bg-white text-derma-blue shadow-sm' : 'text-derma-text-muted hover:text-derma-text'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className="h-10 w-px bg-derma-border mx-1"></div>

              <NotificationCenter />

              <div className="h-10 w-px bg-derma-border mx-2"></div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-derma-blue bg-derma-blue/5 px-2 py-0.5 rounded tracking-tighter uppercase mb-0.5">ADMIN SUPRÊME</span>
                <span className="text-[12px] font-bold text-derma-text opacity-70">Suiza Hub</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-10 bg-derma-bg">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminLayout;