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
        console.log('🔍 Starting fetchProfile for:', email);
        try {
            // 0. Master Admin Check (Case insensitive and trimmed)
            const masterAdmins = [
                'jorge@dermakorswiss.com',
                'torresjorge2812@gmail.com',
                'jorgetorres2812@gmail.com',
                'jorge.torres@dermakor.ch'
            ];

            const normalizedEmail = (email || '').trim().toLowerCase();

            if (normalizedEmail && masterAdmins.some(admin => admin.toLowerCase() === normalizedEmail)) {
                console.log('✅ Master admin detected:', normalizedEmail);
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

            console.log('📊 Querying partner_users table...');
            const { data, error } = await supabase
                .from('partner_users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.log('⚠️ Not in partner_users, checking profiles...');
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
        } catch (error: any) {
            const isAbortError = error.name === 'AbortError' || (error.message && error.message.includes('aborted'));
            if (isAbortError) {
                console.warn('⚠️ Profile fetch aborted:', userId);
            } else {
                console.error('💥 CRITICAL ERROR fetching profile:', error);
                setUser(null);
            }
        } finally {
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
                }
            } catch (err) {
                console.error('Critical Auth Init Error:', err);
            } finally {
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