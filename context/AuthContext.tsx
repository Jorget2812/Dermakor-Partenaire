import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserTier } from '../types';

export type UserRole = 'ADMIN' | 'PARTENAIRE';

export interface AuthUser extends User {
    role: UserRole;
    email?: string; // For Admin
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (userData: AuthUser) => void;
    logout: () => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'dermakor_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Persistence logic
    useEffect(() => {
        const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Failed to parse saved user', error);
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((userData: AuthUser) => {
        setUser(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }, []);

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
