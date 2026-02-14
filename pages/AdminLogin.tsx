import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Lock, Shield, AlertTriangle } from 'lucide-react';

interface AdminLoginProps {
  onBackToPortal: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPortal }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Domain check removed as requested

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Erreur de connexion admin.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-[#E0E0E0] overflow-hidden">

        {/* Header Strip */}
        <div className="h-1 w-full bg-[#1A1A1A]"></div>

        <div className="p-14">
          <div className="text-center mb-10">
            <h1 className="font-oswald text-[28px] text-[#1A1A1A] tracking-[2px] uppercase mb-2">DermaKor Swiss</h1>
            <p className="font-sans text-[13px] text-[#6B6B6B] tracking-wide">Administration Platform</p>
            <div className="h-[2px] w-[180px] bg-[#2C3E50] mx-auto mt-8"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#6B6B6B] mb-2">Identifiant Administrateur</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAFAF8] border border-[#E0E0E0] rounded p-3.5 text-[15px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,26,26,0.08)] transition-all"
                placeholder="jorge@dermakor.ch"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#6B6B6B] mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAFAF8] border border-[#E0E0E0] rounded p-3.5 text-[15px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,26,26,0.08)] transition-all"
                placeholder="••••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#1A1A1A] text-white py-4 rounded font-semibold text-[14px] tracking-[0.5px] uppercase hover:bg-[#2C3E50] hover:-translate-y-px hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2
                ${isLoading ? 'opacity-80 cursor-wait' : ''}
              `}
            >
              {isLoading ? (
                <>Connexion en cours...</>
              ) : (
                <>
                  <Lock size={16} /> Accéder à l'administration
                </>
              )}
            </button>
          </form>

          <div className="mt-8 bg-[#FAFAF8] border border-[#E8E8E8] rounded p-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-[12px] text-[#6B6B6B]">
                <Shield size={12} className="text-[#10B981]" /> Connexion sécurisée SSL
              </li>
              <li className="flex items-center gap-2 text-[12px] text-[#6B6B6B]">
                <AlertTriangle size={12} className="text-[#F59E0B]" /> IP tracking activé
              </li>
              <li className="text-[12px] text-[#6B6B6B] pl-5">
                Session timeout: 8h
              </li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <button onClick={onBackToPortal} className="text-[12px] text-[#6B6B6B] hover:text-[#1A1A1A] underline">
              Retour au portail partenaire
            </button>
          </div>

        </div>
        <div className="bg-[#F5F5F5] py-4 text-center border-t border-[#E0E0E0]">
          <p className="text-[11px] text-[#999] uppercase tracking-wider">Système réservé aux administrateurs</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;