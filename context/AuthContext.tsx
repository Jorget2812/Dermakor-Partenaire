import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
            console.log('Fetching profile for:', email);
            // 0. Master Admin Check (Case insensitive and trimmed)
            const masterAdmins = [
                'jorge@dermakorswiss.com',
                'torresjorge2812@gmail.com',
                'jorgetorres2812@gmail.com',
                'jorge.torres@dermakor.ch' // Added possible corporate email
            ];

            const normalizedEmail = (email || '').trim().toLowerCase();

            if (normalizedEmail && masterAdmins.some(admin => admin.toLowerCase() === normalizedEmail)) {
                console.log('Master Admin detected:', normalizedEmail);
                setUser({
                    id: userId,
                    name: 'Jorge Torres (Master Admin)',
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
                            email: email,
                            role: 'ADMIN',
                            status: 'active',
                            tier: UserTier.PREMIUM,
                            currentSpend: 0,
                            monthlyGoal: 0
                        });
                    } else {
                        console.error('User has no authorized CRM role for portal access');
                        setUser(null);
                    }
                } else {
                    console.error('Profile not found in either table');
                    setUser(null);
                }
            } else {
                console.log('Profile loaded successfully from partner_users');
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
        } catch (error: any) {
            const isAbortError = error.name === 'AbortError' || (error.message && error.message.includes('aborted'));

            if (isAbortError) {
                console.warn('Profile fetch aborted (harmless):', userId);
                // Don't set user to null or isLoading to false if it's just an abort
                // as another request is likely taking over.
                return;
            }

            console.error('CRITICAL ERROR fetching profile:', error);
            setUser(null);
        } finally {
            // Only stop loading if we haven't already returned (e.g. on success or non-abort error)
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                setSession(session);
                if (session?.user) {
                    await fetchProfile(session.user.id, session.user.email || '');
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Critical Auth Init Error:', err);
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

        return () => subscription.unsubscribe();
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