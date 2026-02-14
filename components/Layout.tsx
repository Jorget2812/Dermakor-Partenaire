import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language, User } from '../types';
import { LayoutDashboard, ShoppingBag, GraduationCap, LogOut, Globe, UserCheck, ShieldCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, user, onLogout }) => {
  const { language, setLanguage, t } = useLanguage();

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
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#F9F9F7]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#F9F9F7] border-r border-derma-border flex flex-col fixed h-full z-10 hidden md:flex">
        <div className="p-8 pb-12">
            <h1 className="font-serif text-2xl text-derma-black tracking-tight">DERMAKOR <span className="text-derma-gold">SWISS</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-1">Official Distributor</p>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <NavItem id="dashboard" label={t('nav_dashboard')} icon={LayoutDashboard} />
          <NavItem id="order" label={t('nav_order')} icon={ShoppingBag} />
          <NavItem id="academy" label={t('nav_academy')} icon={GraduationCap} />
        </nav>

        <div className="p-6 border-t border-derma-border">
            <div className="mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{t('dash_welcome')}</p>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-derma-charcoal text-white flex items-center justify-center text-xs font-serif">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-derma-black truncate w-40">{user.instituteName}</span>
                        <div className="flex items-center gap-1 text-[10px] text-derma-gold font-medium">
                           <ShieldCheck size={10} />
                           {user.tier === 'PREMIUM' ? t('common_premium_badge') : t('common_standard_badge')}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                 <div className="flex gap-3 text-[10px] font-bold text-gray-400">
                    {(['FR', 'DE', 'IT'] as Language[]).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => handleLanguageChange(lang)}
                            className={`transition-colors ${language === lang ? 'text-derma-black' : 'hover:text-derma-charcoal'}`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
                <button onClick={onLogout} className="text-gray-400 hover:text-derma-black transition-colors">
                    <LogOut size={16} />
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-6 md:p-12 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto animate-fade-in">
             {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
