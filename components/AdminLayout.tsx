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
  Tag
} from 'lucide-react';
import { AdminPage } from '../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activePage, onNavigate, onLogout }) => {

  const NavItem = ({ id, label, icon: Icon, count }: { id: AdminPage, label: string, icon: any, count?: number }) => {
    const isActive = activePage === id;
    return (
      <button
        onClick={() => onNavigate(id)}
        className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 relative group
          ${isActive
            ? 'text-[#C0A76A] bg-[#C0A76A]/10 border-l-[3px] border-[#C0A76A]'
            : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'
          }`}
      >
        <Icon size={18} className={isActive ? 'text-[#C0A76A]' : 'text-gray-500 group-hover:text-white'} />
        <span className="font-medium tracking-wide">{label}</span>
        {count !== undefined && (
          <span className="ml-auto text-[10px] font-bold bg-[#C0A76A] text-[#1A1A1A] px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex font-sans">

      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#1A1A1A] flex-shrink-0 fixed h-full z-20 flex flex-col">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-white/10">
          <h1 className="font-oswald text-white text-lg tracking-[0.15em] uppercase">
            DermaKor <span className="text-[#C0A76A]">Swiss</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Administration</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />

          <div className="pt-4 pb-2 px-6">
            <p className="text-[10px] uppercase text-gray-600 font-bold tracking-widest">Gestion</p>
          </div>
          <NavItem id="partners" label="Partenaires" icon={Users} count={24} />
          <NavItem id="orders" label="Commandes" icon={ShoppingBag} count={12} />
          <NavItem id="catalog" label="Catalogue" icon={Package} />
          <NavItem id="pricing" label="Prix & Remises" icon={Tag} />

          <div className="pt-4 pb-2 px-6">
            <p className="text-[10px] uppercase text-gray-600 font-bold tracking-widest">Analyse</p>
          </div>
          <NavItem id="reports" label="Rapports" icon={BarChart2} />
          <NavItem id="settings" label="Configuration" icon={Settings} />
        </nav>

        {/* User Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#C0A76A] text-[#1A1A1A] flex items-center justify-center font-bold font-oswald text-sm">
              JT
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Jorge Torres</p>
              <p className="text-[11px] text-gray-500 truncate">jorge@dermakor.ch</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 border border-white/20 rounded text-gray-400 text-xs hover:text-[#C0A76A] hover:border-[#C0A76A] hover:bg-[#C0A76A]/5 transition-all"
          >
            <LogOut size={14} /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-[260px] flex flex-col min-h-screen">

        {/* TOP HEADER BAR */}
        <header className="h-16 bg-white border-b border-[#E8E8E8] sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-oswald text-xl text-[#1A1A1A] uppercase tracking-wide">
              {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Recherche globale..."
                className="pl-9 pr-4 py-1.5 bg-[#FAFAF8] border border-[#E0E0E0] rounded text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] w-64 transition-all"
              />
            </div>

            <div className="h-6 w-px bg-gray-200"></div>

            <div className="flex items-center gap-4">
              <button className="relative w-9 h-9 rounded-full bg-[#FAFAF8] border border-[#E8E8E8] flex items-center justify-center text-gray-500 hover:text-[#C0A76A] hover:border-[#C0A76A] transition-colors">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[10px] font-bold text-white flex items-center justify-center">3</span>
              </button>

              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <span className="text-sm text-gray-600">Admin</span>
                <span className="text-xs font-bold text-[#C0A76A] bg-[#C0A76A]/10 px-2 py-0.5 rounded">SUPERUSER</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-8">
          <div className="max-w-[1400px] mx-auto animate-fade-in">
            {children}
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminLayout;