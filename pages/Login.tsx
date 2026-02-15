import React, { useState, useEffect } from 'react';
import {
    Lock,
    Mail,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { UserTier } from '../types';
import { supabase } from '../utils/supabase';

const Login: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tier, setTier] = useState<UserTier>(UserTier.STANDARD);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (authError) {
                if (authError.message === 'Invalid login credentials') {
                    throw new Error('Identifiants invalides. Veuillez vérifier vos accès.');
                }
                throw authError;
            }

            // Check if user has corresponding tier or admin access
            const { data: profileData, error: profileError } = await supabase
                .from('partner_users')
                .select('status, tier')
                .eq('id', authData.user.id)
                .single();

            if (profileError) {
                // Check for admin
                const { data: adminData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                if (adminData) {
                    navigate('/dashboard');
                    return;
                }
                throw new Error('Profil introuvable.');
            }

            const status = (profileData.status || '').toUpperCase();
            if (status !== 'APPROVED' && status !== 'ACTIVE') {
                await supabase.auth.signOut();
                throw new Error('Votre compte est en attente d\'approbation.');
            }

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setIsLoading(false);
        }
    };

    const isPremium = tier === UserTier.PREMIUM;

    return (
        <div className="min-h-screen bg-[#1A1A1C] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-derma-gold/30">
            {/* Background Texture/Gradient */}
            <div className={`absolute inset-0 transition-opacity duration-700 ${isPremium ? 'opacity-20' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#C0A76A_0%,_transparent_70%)]" />
            </div>

            {/* Back Button */}
            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2.5 px-4 py-2 border border-transparent text-xs uppercase tracking-[0.2em] text-white/60 hover:text-derma-gold hover:border-derma-gold/20 hover:shadow-[0_0_15px_rgba(192,167,106,0.3)] hover:scale-[1.05] hover:-translate-x-[5px] transition-all duration-300 ease-in-out group z-50 rounded-lg"
            >
                <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Retour</span>
            </Link>

            <div className="w-full max-w-[420px] z-10">
                {/* Branding */}
                <div className="text-center mb-10 animate-slide-up">
                    <div className="flex justify-center mb-6">
                        <div className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-500 ${isPremium ? 'border-derma-gold text-derma-gold shadow-[0_0_20px_rgba(192,167,106,0.3)]' : 'border-white/10 text-white/40'}`}>
                            <ShieldCheck size={32} strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="font-oswald text-4xl text-white tracking-[0.15em] uppercase mb-1 drop-shadow-sm">
                        Dermakor <span className={isPremium ? 'text-derma-gold' : ''}>Swiss</span>
                    </h1>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">
                        Strategic Partner Ecosystem
                    </p>
                </div>

                {/* Login Card */}
                <div className={`bg-[#2C2C2E] rounded-2xl p-10 shadow-2xl border transition-all duration-500 relative overflow-hidden ${isPremium ? 'border-derma-gold/50 shadow-derma-gold/5' : 'border-white/5'}`}>
                    {/* Subtle Premium Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-derma-gold/5 to-transparent transition-opacity duration-500 ${isPremium ? 'opacity-100' : 'opacity-0'}`} />

                    <div className="relative z-10">
                        {/* Tier Selection */}
                        <div className="flex bg-[#1A1A1C] p-1 rounded-xl mb-10 border border-white/5">
                            <button
                                onClick={() => setTier(UserTier.STANDARD)}
                                className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-luxury ${!isPremium ? 'bg-[#3A3A3C] text-white shadow-lg' : 'text-white/30 hover:text-white/60'}`}
                            >
                                Standard
                            </button>
                            <button
                                onClick={() => setTier(UserTier.PREMIUM)}
                                className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-luxury ${isPremium ? 'bg-derma-gold text-[#1A1A1C] shadow-lg' : 'text-white/30 hover:text-white/60'}`}
                            >
                                Premium
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] font-bold text-red-500 animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">
                                    Email Professionnel
                                </label>
                                <div className="relative group">
                                    <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPremium ? 'text-derma-gold/40 group-focus-within:text-derma-gold' : 'text-white/20 group-focus-within:text-white'}`} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="votre@clinique.ch"
                                        required
                                        className={`w-full bg-[#1A1A1C] border border-white/5 px-12 py-4 text-white text-sm rounded-xl focus:outline-none transition-all duration-300 ${isPremium ? 'focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5' : 'focus:border-white/20 focus:ring-4 focus:ring-white/5'}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">
                                    Mot de Passe
                                </label>
                                <div className="relative group">
                                    <Lock size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPremium ? 'text-derma-gold/40 group-focus-within:text-derma-gold' : 'text-white/20 group-focus-within:text-white'}`} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className={`w-full bg-[#1A1A1C] border border-white/5 px-12 py-4 text-white text-sm rounded-xl focus:outline-none transition-all duration-300 ${isPremium ? 'focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5' : 'focus:border-white/20 focus:ring-4 focus:ring-white/5'}`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-[0.2em] transition-luxury mt-4 disabled:opacity-50
                                    ${isPremium
                                        ? 'bg-derma-gold text-[#1A1A1C] hover:shadow-[0_10px_30px_rgba(192,167,106,0.2)] hover:-translate-y-0.5'
                                        : 'bg-white text-[#1A1A1C] hover:bg-white/90 shadow-lg hover:-translate-y-0.5'}`}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        Accès Collaborateur
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4 text-center">
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">
                                Swiss Precision • Medical Grade Standards
                            </p>

                            {/* Hidden Admin Access */}
                            <Link
                                to="/admin/login"
                                className="text-[7px] text-white/5 hover:text-derma-gold/20 transition-all cursor-default"
                            >
                                Executive Portal Access
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="mt-12 flex justify-center gap-12 opacity-10">
                    <div className="w-12 h-[1px] bg-white"></div>
                    <div className="w-2 h-2 rounded-full border border-white"></div>
                    <div className="w-12 h-[1px] bg-white"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;