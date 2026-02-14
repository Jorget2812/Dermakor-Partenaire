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
            const { data, error } = await supabase
                .from('partner_users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Check if it's the master admin by email
                if (email.toLowerCase() === 'jorge@dermakorswiss.com') {
                    setUser({
                        id: userId,
                        name: 'Jorge (Admin)',
                        email: email,
                        role: 'ADMIN',
                        status: 'active',
                        tier: UserTier.PREMIUM,
                        currentSpend: 0,
                        monthlyGoal: 0
                    });
                    setIsLoading(false);
                    return;
                }

                // If not in partner_users, check the CRM profiles table
                const { data: adminData, error: adminError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (adminData && !adminError) {
                    // Map CRM roles: 'admin', 'directeur', 'manager' and 'vendeur' are all ADMINS in the portal
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
                setUser({
                    id: data.id,
                    name: data.contact_name,
                    instituteName: data.company_name,
                    email: data.email,
                    role: 'PARTENAIRE',
                    status: data.status,
                    tier: UserTier.STANDARD,
                    currentSpend: 0,
                    monthlyGoal: 800
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial check
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session?.user) {
                await fetchProfile(session.user.id, session.user.email || '');
            } else {
                setIsLoading(false);
            }
        };
        init();

        // Listen for changes
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
