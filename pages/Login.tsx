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

    const [step, setStep] = useState<1 | 2>(1);
    const [selectedTier, setSelectedTier] = useState<UserTier | null>(null);
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

    const handleTierSelect = (tier: UserTier) => {
        setSelectedTier(tier);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
        setSelectedTier(null);
        setId('');
        setPassword('');
    };

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

            // 2. Check Partner Status
            const { data: profileData, error: profileError } = await supabase
                .from('partner_users')
                .select('status')
                .eq('id', authData.user.id)
                .single();

            if (profileError) {
                console.log('Partner profile not found, checking if admin...');
                // Checking if admin via profiles table is handled in AuthContext, 
                // but we need to know if we should redirect to admin dashboard here.
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

            console.log('Profile status:', profileData.status);

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
            setError(err.message || 'Une erreur est survenue lors de la connexion.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- ICONS ---
    const BuildingIcon = () => (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 42H42" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 42V14L24 6L38 14V42" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 42V28H30V42" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 18H20" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M28 18H30" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18 24H20" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M28 24H30" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );

    const CrownIcon = () => (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="#C0A76A" />
                    <stop offset="100%" stopColor="#D4B87C" />
                </linearGradient>
            </defs>
            <path d="M4 36H44L38 10L24 22L10 10L4 36Z" stroke="url(#goldGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="url(#goldGrad)" fillOpacity="0.1" />
            <circle cx="24" cy="8" r="3" fill="url(#goldGrad)" />
            <circle cx="42" cy="6" r="2" fill="url(#goldGrad)" />
            <circle cx="6" cy="6" r="2" fill="url(#goldGrad)" />
            <path d="M10 42H38" stroke="url(#goldGrad)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );

    return (
        <div className="min-h-screen bg-derma-cream flex items-center justify-center p-4 md:p-8 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-2 bg-derma-gold opacity-50"></div>

            {/* Language Switcher - Top Right */}
            <div className="absolute top-6 right-6 md:top-10 md:right-12 z-20 flex items-center text-sm font-sans tracking-wide">
                {(['FR', 'DE', 'IT'] as Language[]).map((lang, index) => (
                    <React.Fragment key={lang}>
                        <button
                            onClick={() => setLanguage(lang)}
                            className={`transition-colors duration-200 ${language === lang ? 'text-derma-gold font-semibold' : 'text-[#6B6B6B] hover:text-derma-black font-normal'}`}
                        >
                            {lang}
                        </button>
                        {index < 2 && <span className="mx-2 text-gray-300">|</span>}
                    </React.Fragment>
                ))}
            </div>

            <div className="w-full max-w-6xl flex flex-col items-center z-10">

                {/* Main Logo Header - Always visible but smaller on mobile */}
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="font-oswald font-light text-4xl md:text-5xl uppercase tracking-[0.1em] text-derma-black mb-2">DERMAKOR</h1>
                    <p className="font-sans text-xs md:text-sm uppercase tracking-[0.2em] text-[#6B6B6B]">{t('login_subtitle')}</p>
                    <div className="h-0.5 w-16 bg-derma-gold mx-auto mt-6"></div>
                </div>

                {/* STEP 1: TIER SELECTION */}
                {step === 1 && (
                    <div className="w-full animate-fade-in">
                        <p className="text-center font-sans text-[#1A1A1A] mb-10 text-lg md:text-xl font-light">{t('login_select_level')}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-4xl mx-auto">

                            {/* STANDARD CARD */}
                            <div
                                className="bg-white rounded-lg border-2 border-derma-border p-8 md:p-12 shadow-standard hover:shadow-standard-hover hover:border-derma-blue hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                                onClick={() => handleTierSelect(UserTier.STANDARD)}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="font-oswald text-2xl md:text-3xl font-light text-derma-black tracking-wide">{t('login_std_title')}</h2>
                                    <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                                        <BuildingIcon />
                                    </div>
                                </div>

                                <p className="font-sans text-sm text-[#6B6B6B] mb-2">{t('login_std_subtitle')}</p>
                                <p className="font-sans text-xl font-bold text-derma-black mb-8">{t('login_std_price')}</p>

                                <div className="w-full h-px bg-gray-100 mb-6"></div>

                                <ul className="space-y-3 mb-10 min-h-[140px]">
                                    {t('login_std_features').split(',').map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-sans text-[#6B6B6B]">
                                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                            {feature.trim()}
                                        </li>
                                    ))}
                                </ul>

                                <button className="w-full bg-derma-blue hover:bg-derma-blueDark text-white font-sans font-semibold text-sm py-4 px-6 rounded transition-colors uppercase tracking-wider flex justify-between items-center group-hover:pl-8 transition-all">
                                    {t('login_btn_access')}
                                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                                </button>
                            </div>

                            {/* PREMIUM CARD */}
                            <div
                                className="bg-white rounded-lg border-2 border-[#C0A76A]/30 p-8 md:p-12 shadow-premium hover:shadow-premium-hover hover:border-derma-gold hover:-translate-y-2 transition-all duration-400 ease-out group cursor-pointer relative overflow-hidden"
                                onClick={() => handleTierSelect(UserTier.PREMIUM)}
                            >
                                {/* Glow effect */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-derma-gold opacity-5 rounded-full blur-3xl pointer-events-none"></div>

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <h2 className="font-oswald text-2xl md:text-3xl font-light text-derma-black tracking-wide flex items-center gap-2">
                                        {t('login_prem_title')}
                                        <span className="text-lg">⭐</span>
                                    </h2>
                                    <div className="opacity-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                        <CrownIcon />
                                    </div>
                                </div>

                                <p className="font-sans text-sm text-[#6B6B6B] mb-2">{t('login_prem_subtitle')}</p>
                                <p className="font-sans text-xl font-bold text-derma-black mb-8">{t('login_prem_price')}</p>

                                <div className="w-full h-px bg-gradient-to-r from-[#C0A76A]/50 to-transparent mb-6"></div>

                                <ul className="space-y-3 mb-10 min-h-[140px] relative z-10">
                                    {t('login_prem_features').split(',').map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-sans text-derma-black font-medium">
                                            <Check size={14} className="text-derma-gold mt-1 flex-shrink-0" />
                                            {feature.trim()}
                                        </li>
                                    ))}
                                </ul>

                                <button className="w-full bg-gradient-to-r from-[#C0A76A] to-[#D4B87C] text-white font-sans font-semibold text-sm py-4 px-6 rounded uppercase tracking-wider flex justify-between items-center btn-shine shadow-lg relative z-10">
                                    {t('login_btn_access')}
                                    <ArrowRight size={16} />
                                </button>
                            </div>

                        </div>

                        <div className="mt-16 text-center">
                            <p className="text-sm font-sans text-[#6B6B6B]">
                                {t('login_no_account')}
                                <button
                                    onClick={() => navigate('/')}
                                    className="ml-2 text-derma-gold hover:underline font-medium"
                                >
                                    {t('login_become_partner')}
                                </button>
                            </p>
                        </div>
                    </div>
                )}

                {/* STEP 2: LOGIN FORM */}
                {step === 2 && selectedTier && (
                    <div className="w-full max-w-md animate-in slide-in-from-bottom-8 fade-in duration-500">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-[#6B6B6B] hover:text-derma-black text-xs uppercase tracking-wider mb-8 transition-colors group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t('login_back')}
                        </button>

                        <div className={`bg-white rounded-lg p-8 md:p-10 border-t-4 shadow-xl ${selectedTier === UserTier.PREMIUM ? 'border-derma-gold shadow-premium' : 'border-derma-blue shadow-standard'}`}>

                            <div className="mb-8">
                                <h2 className="font-oswald text-2xl font-light text-derma-black uppercase tracking-wide">DERMAKOR SWISS</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-sans text-sm font-medium text-[#6B6B6B] uppercase tracking-wider">
                                        {selectedTier === UserTier.PREMIUM ? t('login_space_prem') : t('login_space_std')}
                                    </span>
                                    {selectedTier === UserTier.PREMIUM && <span>⭐</span>}
                                </div>
                            </div>

                            <div className={`w-full h-0.5 mb-8 ${selectedTier === UserTier.PREMIUM ? 'bg-derma-gold' : 'bg-derma-blue'}`}></div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-[#6B6B6B] mb-2">
                                        {selectedTier === UserTier.PREMIUM ? t('login_id_label_prem') : t('login_id_label')}
                                    </label>
                                    <input
                                        type="text"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        placeholder={selectedTier === UserTier.PREMIUM ? "CH-78XX-P" : "CH-78XX"}
                                        className={`w-full bg-[#FAFAF8] border px-4 py-3.5 text-[#1A1A1A] font-sans text-[15px] rounded transition-all focus:outline-none placeholder-gray-300
                                    ${selectedTier === UserTier.PREMIUM
                                                ? 'border-derma-border focus:border-derma-gold focus:ring-4 focus:ring-[#C0A76A]/10'
                                                : 'border-derma-border focus:border-derma-blue focus:ring-1 focus:ring-derma-blue/20'
                                            }
                                `}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-[#6B6B6B] mb-2">
                                        {t('login_pwd_label')}
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full bg-[#FAFAF8] border px-4 py-3.5 text-[#1A1A1A] font-sans text-[15px] rounded transition-all focus:outline-none placeholder-gray-300
                                    ${selectedTier === UserTier.PREMIUM
                                                ? 'border-derma-border focus:border-derma-gold focus:ring-4 focus:ring-[#C0A76A]/10'
                                                : 'border-derma-border focus:border-derma-blue focus:ring-1 focus:ring-derma-blue/20'
                                            }
                                `}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3.5 rounded font-sans font-semibold text-sm uppercase tracking-wider text-white shadow-md transition-all flex justify-center items-center gap-3 mt-4
                                ${selectedTier === UserTier.PREMIUM
                                            ? 'bg-gradient-to-r from-[#C0A76A] to-[#D4B87C] hover:shadow-lg btn-shine'
                                            : 'bg-derma-blue hover:bg-derma-blueDark hover:shadow-lg'
                                        }
                                ${isLoading ? 'opacity-80 cursor-wait' : ''}
                            `}
                                >
                                    {isLoading ? (
                                        <span className="animate-pulse flex items-center gap-2">
                                            <span className="block w-2 h-2 rounded-full bg-white animate-bounce"></span>
                                            {selectedTier === UserTier.PREMIUM ? 'Accès Premium...' : 'Connexion...'}
                                        </span>
                                    ) : (
                                        <>
                                            {selectedTier === UserTier.PREMIUM && <Lock size={14} />}
                                            {selectedTier === UserTier.PREMIUM ? 'Accéder Premium' : t('login_btn_access')}
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 text-center">
                                <div className={`flex items-center justify-center gap-2 text-[11px] font-sans font-medium tracking-wide
                             ${selectedTier === UserTier.PREMIUM ? 'text-derma-gold' : 'text-[#6B6B6B]'}
                        `}>
                                    {selectedTier === UserTier.PREMIUM ? <CheckCircle2 size={12} /> : <ShieldCheck size={12} />}
                                    {selectedTier === UserTier.PREMIUM ? t('login_secure_prem') : t('login_secure_std')}
                                </div>
                                <button
                                    onClick={() => navigate('/admin/login')}
                                    className="mt-6 text-[8px] text-gray-400 hover:text-derma-gold transition-opacity opacity-[0.01] hover:opacity-[0.07] uppercase tracking-tighter"
                                >
                                    .
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Login;