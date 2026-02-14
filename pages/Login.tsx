import React, { useState, useEffect } from 'react';
import {
    Building2,
    Lock,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    ShieldCheck,
    Globe,
    Star,
    Loader2,
    Check,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserTier, Language } from '../types';
import { supabase } from '../utils/supabase';
import { useLanguage } from '../context/LanguageContext';

const Login: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If already authenticated, redirect to dashboard
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
            console.log('Attempting login for:', id);
            // 1. Supabase Auth Sign In
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: id, // User enters email in the ID field
                password: password,
            });

            if (authError) {
                console.error('Auth error:', authError);
                if (authError.message === 'Invalid login credentials') {
                    throw new Error('Identifiants invalides. Veuillez vérifier votre email et mot de passe.');
                }
                throw authError;
            }

            console.log('Auth success, fetching profile for:', authData.user.id);

            // 2. Check Partner Status (or Admin)
            const { data: profileData, error: profileError } = await supabase
                .from('partner_users')
                .select('status')
                .eq('id', authData.user.id)
                .single();

            if (profileError) {
                console.log('Partner profile not found, checking if admin...');
                const { data: adminData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                if (adminData) {
                    navigate('/admin/dashboard');
                    return;
                }
                throw new Error('Profil introuvable. Veuillez contacter le support.');
            }

            if (profileData.status === 'pending') {
                await supabase.auth.signOut();
                throw new Error('Votre compte est en attente d\'approbation. Nous vous contacterons bientôt.');
            }

            if (profileData.status === 'rejected') {
                await supabase.auth.signOut();
                throw new Error('Votre demande d\'accès a été refusée. Veuillez nous contacter pour plus d\'informations.');
            }

            // Success! 
            navigate('/dashboard');

        } catch (err: any) {
            console.error('Login catch error:', err);
            setError(err.message || 'Une erreur est survenue lors de la conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-derma-cream flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-derma-gold opacity-40"></div>

            {/* Language Switcher - Top Right */}
            <div className="absolute top-6 right-6 md:top-10 md:right-12 z-20 flex items-center text-xs tracking-widest font-medium uppercase">
                {(['FR', 'DE', 'IT'] as Language[]).map((lang, index) => (
                    <React.Fragment key={lang}>
                        <button
                            onClick={() => setLanguage(lang)}
                            className={`transition-all duration-300 px-2 py-1 ${language === lang ? 'text-derma-gold border-b border-derma-gold' : 'text-gray-400 hover:text-derma-black font-normal'}`}
                        >
                            {lang}
                        </button>
                        {index < 2 && <span className="mx-1 text-gray-200">|</span>}
                    </React.Fragment>
                ))}
            </div>

            <div className="w-full max-w-[440px] z-10 animate-fade-in">

                {/* Main Logo Header */}
                <div className="text-center mb-10">
                    <h1 className="font-oswald font-light text-4xl md:text-5xl uppercase tracking-[0.15em] text-derma-black mb-1">DERMAKOR</h1>
                    <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">{t('login_subtitle')}</p>
                    <div className="h-[1px] w-12 bg-derma-gold/40 mx-auto mt-6"></div>
                </div>

                {/* LOGIN FORM BOX */}
                <div className="bg-white rounded-lg p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-derma-border relative">

                    <div className="mb-10 text-center">
                        <h2 className="font-oswald text-xl font-light text-derma-black uppercase tracking-widest">{t('login_title')}</h2>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">{t('login_secure')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-7">
                        {error && (
                            <div className="bg-red-50 border-l-2 border-red-400 p-4 text-xs text-red-700 font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-derma-black/60 pl-1">
                                {t('login_id_label')}
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    placeholder="email@recherche.com"
                                    required
                                    className="w-full bg-[#FAFAF9] border border-derma-border px-4 py-4 text-derma-black font-sans text-sm rounded-md transition-all focus:outline-none focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5 placeholder-gray-300"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-derma-gold transition-colors">
                                    <Globe size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-derma-black/60 pl-1">
                                {t('login_pwd_label')}
                            </label>
                            <div className="relative group">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#FAFAF9] border border-derma-border px-4 py-4 text-derma-black font-sans text-sm rounded-md transition-all focus:outline-none focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5 placeholder-gray-300"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-derma-gold transition-colors">
                                    <Lock size={16} />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-derma-black hover:bg-[#2C2C2C] text-white font-sans font-bold text-xs uppercase tracking-[0.2em] rounded shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <Loader2 size={16} className="animate-spin text-derma-gold" />
                            ) : (
                                <>
                                    {t('login_btn')}
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-derma-border text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                            DermaKor Swiss Elite Partner Portal
                        </p>

                        {/* Hidden Admin Entry */}
                        <button
                            onClick={() => navigate('/admin/login')}
                            className="mt-6 text-[8px] text-gray-100/10 hover:text-derma-gold/20 transition-all cursor-default"
                        >
                            .
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center flex flex-col items-center gap-4 opacity-40">
                    <div className="flex items-center gap-8">
                        <ShieldCheck size={18} className="text-derma-black" />
                        <Star size={18} className="text-derma-black" />
                        <Building2 size={18} className="text-derma-black" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;