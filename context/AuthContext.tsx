import * as React from 'react';
import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserTier } from '../types';
import { supabase } from '../utils/supabase';
import { Session } from '@supabase/supabase-js';

export type UserRole = 'ADMIN' | 'PARTENAIRE';

export interface AuthUser extends User {
    role: UserRole;
    email: string;
    status: 'pending' | 'approved' | 'rejected' | 'active';
    completedResources: string[];
    certificates: string[];
}

interface AuthContextType {
    user: AuthUser | null;
    session: Session | null;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    resetApp: () => void;
    isLoading: boolean;
    toggleSimulation: (tier?: UserTier) => Promise<void>;
    isSimulatingPartner: boolean;
    simulatedTier: UserTier | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSimulatingPartner, setIsSimulatingPartner] = useState(() => {
        return localStorage.getItem('derma_simulating_partner') === 'true';
    });
    const [simulatedTier, setSimulatedTier] = useState<UserTier | null>(() => {
        return localStorage.getItem('derma_simulated_tier') as UserTier || null;
    });
    const isInitializing = React.useRef(false);
    const failsafeTimer = React.useRef<any>(null);

    // Helper to wrap promises with timeout
    const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number = 8000, context: string = ''): Promise<T> => {
        let timeoutId: any;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
                console.warn(`AuthContext: Timeout reached for ${context} after ${timeoutMs}ms`);
                reject(new Error(`TIMEOUT_${context}`));
            }, timeoutMs);
        });

        try {
            const result = await Promise.race([promise, timeoutPromise]);
            clearTimeout(timeoutId!);
            return result as T;
        } catch (err) {
            clearTimeout(timeoutId!);
            throw err;
        }
    };

    const fetchProfile = async (userId: string, email: string, simulationMode?: boolean, targetTier?: UserTier | null) => {
        // Solo mostrar cargando si no tenemos ya un usuario (evita el parpadeo que bloquea el login)
        if (!user) setIsLoading(true);

        const activeSimulation = simulationMode !== undefined ? simulationMode : isSimulatingPartner;
        const activeTier = targetTier !== undefined ? targetTier : simulatedTier;

        try {
            console.log(`AuthContext: Fetching profile and calculating tiers for ${email}`);

            const masterAdmins = [
                'jorge@dermakorswiss.com',
                'jorge@dermakor.com',
                'jorge@dermakor.ch',
                'torresjorge2812@gmail.com',
                'jorgetorres2812@gmail.com',
                'georgitorres2812@gmail.com',
                'admin@dermakorswiss.com'
            ];

            const normalizedEmail = (email || '').trim().toLowerCase();
            const isMasterAdmin = normalizedEmail && masterAdmins.some(admin => admin.toLowerCase() === normalizedEmail);

            // Fetch Partner Data safely with timeout
            const partnerQuery = supabase
                .from('partner_users')
                .select('*')
                .eq('email', normalizedEmail);

            const { data: partners, error: partnerError } = (await withTimeout(Promise.resolve(partnerQuery), 5000, 'fetchPartner')
                .catch(e => ({ data: null, error: e }))) as any;

            if (partnerError) {
                console.error('AuthContext: Partner fetch error:', partnerError);
            }

            const partner = (partners && partners.length > 0) ? partners[0] : null;

            // Fetch Orders/Spend with timeout
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            const spendQuery = supabase
                .from('orders')
                .select('total_amount')
                .eq('partner_id', partner?.id || userId)
                .gte('created_at', startOfMonth);

            const { data: orders, error: ordersError } = (await withTimeout(Promise.resolve(spendQuery), 4000, 'fetchSpend')
                .catch(e => ({ data: [], error: e }))) as any;

            if (ordersError) {
                console.warn('AuthContext: Orders fetch error (continuing with 0):', ordersError);
            }

            const currentSpend = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

            // Fetch Academy data with timeout
            const academyQuery = supabase
                .from('academy_completions')
                .select('resource_id')
                .eq('partner_id', partner?.id || userId);

            const completions = (await withTimeout(Promise.resolve(academyQuery), 3000, 'fetchAcademyCompletions')
                .then((r: any) => r.data || [])
                .catch(() => [])) as any[];

            const certsQuery = supabase
                .from('academy_certificates')
                .select('level_id')
                .eq('partner_id', partner?.id || userId);

            const certificatesData = (await withTimeout(Promise.resolve(certsQuery), 3000, 'fetchAcademyCertificates')
                .then((r: any) => r.data || [])
                .catch(() => [])) as any[];

            const completedResources = completions.map(c => c.resource_id) || [];
            const certificates = certificatesData.map(c => c.level_id) || [];

            // Determine Tier Logic
            // Priority: Active Simulation > Saved Partner Tier > Spend-based Tier
            let calculatedTier = activeTier || (partner?.tier as UserTier) || UserTier.STANDARD;
            let monthlyGoal = 300;

            if (!activeTier) {
                // Dynamic upgrade based on spend if not simulating
                if (currentSpend >= 4000) {
                    calculatedTier = UserTier.PREMIUM_ELITE;
                } else if (currentSpend >= 2000) {
                    calculatedTier = UserTier.PREMIUM_PRO;
                } else if (currentSpend >= 800 && calculatedTier === UserTier.STANDARD) {
                    // Only auto-upgrade to BASE if they were STANDARD
                    calculatedTier = UserTier.PREMIUM_BASE;
                }
            }

            // Set monthly goal based on the final tier
            if (calculatedTier === UserTier.PREMIUM_ELITE) monthlyGoal = 4000;
            else if (calculatedTier === UserTier.PREMIUM_PRO) monthlyGoal = 2000;
            else if (calculatedTier === UserTier.PREMIUM_BASE || calculatedTier === UserTier.PREMIUM) monthlyGoal = 800;
            else monthlyGoal = 300;

            console.log(`AuthContext: Final tier: ${calculatedTier}, Monthly goal: ${monthlyGoal}`);

            // Profit Calculation (Mock margins for demonstration)
            const margin = calculatedTier === UserTier.PREMIUM_ELITE ? 0.44 :
                calculatedTier === UserTier.PREMIUM_PRO ? 0.42 :
                    calculatedTier === UserTier.PREMIUM_BASE ? 0.40 : 0.35;

            const estimatedRetailSales = currentSpend / (1 - margin);
            const estimatedProfit = estimatedRetailSales - currentSpend;
            console.log(`AuthContext: Profit calculation - Margin: ${margin}, Estimated Retail Sales: ${estimatedRetailSales}, Estimated Profit: ${estimatedProfit}`);

            const userData: AuthUser = {
                id: partner?.id || userId,
                name: partner?.contact_name || (isMasterAdmin ? 'Jorge Torres' : 'Admin'),
                instituteName: partner?.company_name || (isMasterAdmin ? 'DermaKor Swiss (HQ)' : 'DermaKor Partner'),
                email: normalizedEmail,
                role: activeSimulation ? 'PARTENAIRE' : (isMasterAdmin ? 'ADMIN' : 'PARTENAIRE'),
                status: partner?.status || 'active',
                tier: calculatedTier,
                currentSpend: currentSpend,
                monthlyGoal: monthlyGoal,
                consecutiveMonths: partner?.consecutive_months || 0,
                ranking: calculatedTier === UserTier.PREMIUM_ELITE ? 7 : undefined, // Mock ranking for now
                profitData: {
                    estimatedRetailSales,
                    estimatedProfit,
                    margin: margin * 100
                },
                academyAccessStatus: partner?.academy_access_status || 'ACTIVE',
                academyAccessType: partner?.academy_access_type || 'AUTOMATIC',
                academyAccessUntil: partner?.academy_access_until,
                address: partner?.address || '',
                completedResources,
                certificates
            };

            setUser(userData);
            console.log('AuthContext: Profile loaded successfully for', normalizedEmail);
        } catch (err: any) {
            console.error('AuthContext: fetchProfile CRITICAL ERROR:', err);
            // Provide a extreme fallback to avoid app crash
            console.warn('AuthContext: Providing emergency fallback user');
            setUser({
                id: userId,
                name: (email || 'Partner').split('@')[0],
                instituteName: isMasterAdmin ? 'DermaKor Swiss (HQ)' : 'DermaKor Partner',
                email: email || 'partner@dermakor.ch',
                role: isMasterAdmin ? 'ADMIN' : 'PARTENAIRE',
                status: 'active',
                tier: UserTier.STANDARD,
                currentSpend: 0,
                monthlyGoal: 300,
                consecutiveMonths: 0,
                profitData: {
                    estimatedRetailSales: 0,
                    estimatedProfit: 0,
                    margin: 35
                }
            } as AuthUser);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSimulation = async (tier?: UserTier) => {
        const newValue = tier ? true : !isSimulatingPartner;
        const newTier = tier || null;

        console.log('AuthContext: Toggling simulation to', newValue, 'Tier:', newTier);
        setIsSimulatingPartner(newValue);
        setSimulatedTier(newTier);

        localStorage.setItem('derma_simulating_partner', String(newValue));
        if (newTier) localStorage.setItem('derma_simulated_tier', newTier);
        else localStorage.removeItem('derma_simulated_tier');

        // Refresh profile with NEW simulation mode value
        if (session?.user) {
            await fetchProfile(session.user.id, session.user.email || '', newValue, newTier);
        }
    };

    const logout = async () => {
        console.log('AuthContext: Logging out...');
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('AuthContext: Logout error:', err);
        } finally {
            setSession(null);
            setUser(null);
            localStorage.removeItem('derma_simulating_partner');
            localStorage.removeItem('derma_simulated_tier');
        }
    };

    const resetApp = () => {
        console.warn('AuthContext: EMERGENCY RESET TRIGGERED');
        localStorage.clear();
        sessionStorage.clear();
        // Set state to unauth immediately
        setSession(null);
        setUser(null);
        setIsLoading(false);
        isInitializing.current = false;
        // Attempt clean signout if possible
        try { supabase.auth.signOut().catch(() => { }); } catch (e) { }
        // Force hard redirect to login
        window.location.href = '/login';
    };

    useEffect(() => {
        // STRONG FAILSAFE: Ensure loading finishes no matter what after 7 seconds
        // This timer runs independently of everything else
        console.log('AuthContext: Starting 7s failsafe...');
        const timer = setTimeout(() => {
            setIsLoading(current => {
                if (current) {
                    console.warn('AuthContext: EMERGENCY FAILSAFE TRIGGERED. Forcing isLoading = false.');
                    return false;
                }
                return current;
            });
        }, 7000);

        failsafeTimer.current = timer;

        const init = async () => {
            if (isInitializing.current) return;
            isInitializing.current = true;

            console.log('AuthContext: Initializing session...');
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('AuthContext: Session fetch error:', error);
                    setIsLoading(false);
                    return;
                }

                setSession(session);
                if (session?.user) {
                    console.log('AuthContext: Session detected, fetching profile...');
                    await fetchProfile(session.user.id, session.user.email || '');
                } else {
                    console.log('AuthContext: No session found on init');
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('AuthContext: Init exception:', err);
                setIsLoading(false);
            } finally {
                // Ensure isInitializing is only reset if we really failed or want a re-run
                // but usually it's a one-shot
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('AuthContext: Auth event:', event);

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setIsLoading(false);
                isInitializing.current = false;
                return;
            }

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setSession(session);
                if (session?.user) {
                    // Only fetch if user is not already set or it's a new session
                    await fetchProfile(session.user.id, session.user.email || '');
                }
            }
        });

        return () => {
            clearTimeout(timer);
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        user,
        session,
        isAuthenticated: !!session,
        logout,
        resetApp,
        isLoading,
        toggleSimulation,
        isSimulatingPartner,
        simulatedTier
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
