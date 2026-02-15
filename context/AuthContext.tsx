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
}

interface AuthContextType {
    user: AuthUser | null;
    session: Session | null;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string, email: string) => {
        try {
            const masterAdmins = [
                'jorge@dermakorswiss.com',
                'jorge@dermakor.com',
                'torresjorge2812@gmail.com',
                'jorgetorres2812@gmail.com',
                'georgitorres2812@gmail.com'
            ];

            const normalizedEmail = (email || '').trim().toLowerCase();

            if (normalizedEmail && masterAdmins.some(admin => admin.toLowerCase() === normalizedEmail)) {
                setUser({
                    id: userId,
                    name: 'Jorge Torres (Master Admin)',
                    instituteName: 'DermaKor Swiss (HQ)',
                    email: normalizedEmail,
                    role: 'ADMIN',
                    status: 'active',
                    tier: UserTier.PREMIUM,
                    currentSpend: 0,
                    monthlyGoal: 0
                });
                return;
            }

            const { data, error } = await supabase
                .from('partner_users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // FALLBACK: Search by email if ID not found (autolink)
                const { data: emailMatch, error: emailError } = await supabase
                    .from('partner_users')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (emailMatch && !emailError) {
                    console.log('AuthContext: Found partner by email, autolinking ID...');
                    // Update ID in the database to match the auth ID
                    await supabase
                        .from('partner_users')
                        .update({ id: userId })
                        .eq('email', email);

                    setUser({
                        id: userId,
                        name: emailMatch.contact_name || 'Socio',
                        instituteName: emailMatch.company_name,
                        email: emailMatch.email,
                        role: 'PARTENAIRE',
                        status: emailMatch.status || 'pending',
                        tier: (emailMatch.tier as UserTier) || UserTier.STANDARD,
                        currentSpend: 0,
                        monthlyGoal: 800
                    });
                    return;
                }

                const { data: adminData, error: adminError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (adminData && !adminError) {
                    const displayName = adminData.full_name ||
                        `${adminData.first_name || ''} ${adminData.last_name || ''}`.trim() ||
                        'Admin';

                    const isAdminRole = ['admin', 'directeur', 'manager', 'vendeur'].includes(adminData.role?.toLowerCase());

                    if (isAdminRole) {
                        setUser({
                            id: userId,
                            name: displayName,
                            instituteName: adminData.institute_name || 'DermaKor Swiss',
                            email: email,
                            role: 'ADMIN',
                            status: 'active',
                            tier: UserTier.PREMIUM,
                            currentSpend: 0,
                            monthlyGoal: 0
                        });
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } else {
                setUser({
                    id: data.id,
                    name: data.contact_name || 'Socio',
                    instituteName: data.company_name,
                    email: data.email,
                    role: 'PARTENAIRE',
                    status: data.status || 'pending',
                    tier: (data.tier as UserTier) || UserTier.STANDARD,
                    currentSpend: 0,
                    monthlyGoal: 800
                });
            }
        } catch (err: any) {
            console.error('AuthContext: fetchProfile error:', err);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Failsafe: prevent infinite loading
        const timer = setTimeout(() => {
            if (isLoading) {
                console.warn('AuthContext: Failsafe triggered after 3s');
                setIsLoading(false);
            }
        }, 3000);

        const init = async () => {
            console.log('AuthContext: Initializing session...');
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('AuthContext: Session fetch error:', error);
                    setIsLoading(false);
                    return;
                }

                console.log('AuthContext: Session result:', { hasSession: !!session, userEmail: session?.user?.email });
                setSession(session);
                if (session?.user) {
                    console.log('AuthContext: Fetching profile for:', session.user.id);
                    await fetchProfile(session.user.id, session.user.email || '');
                } else {
                    console.log('AuthContext: No active session found.');
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('AuthContext: Init exception:', err);
                setIsLoading(false);
            } finally {
                console.log('AuthContext: Init sequence complete.');
                setIsLoading(false);
            }
        };
        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                await fetchProfile(session.user.id, session.user.email || '');
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => {
            clearTimeout(timer);
            subscription.unsubscribe();
        };
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    }, []);

    const value = {
        user,
        session,
        isAuthenticated: !!session,
        logout,
        isLoading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};