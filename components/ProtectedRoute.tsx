import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-derma-gold"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // If Admin mode was requested, redirect to admin login
        const isAdminPath = location.pathname.startsWith('/admin');
        const loginPath = isAdminPath ? '/admin/login' : '/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Check Partner Status
    if (user && user.role === 'PARTENAIRE' &&
        user.status?.toUpperCase() !== 'APPROVED' &&
        user.status?.toUpperCase() !== 'ACTIVE') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#FAFAF8]">
                <div className="max-w-md p-8 bg-white border border-gray-100 rounded-xl shadow-premium">
                    <h2 className="font-oswald text-2xl mb-4 text-derma-black uppercase">Compte non approuvé</h2>
                    <p className="text-gray-500 mb-6">
                        {user.status === 'pending'
                            ? "Votre compte est en cours d'examen. Nous vous contacterons dès qu'il sera approuvé."
                            : "Votre accès a été suspendu ou refusé. Veuillez contacter le support."}
                    </p>
                    <button
                        onClick={async () => {
                            await logout();
                            window.location.href = '/';
                        }}
                        className="bg-derma-black text-white px-8 py-3 rounded text-xs uppercase tracking-widest hover:bg-derma-gold transition-colors"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
        // Role not allowed, redirect to relevant dashboard or home
        const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    if (!user) {
        // Authenticated but no profile found - logout and go to landing
        console.log('🛑 ProtectedRoute: Authenticated but no user profile found:', { isAuthenticated, isLoading });
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#FAFAF8]">
                <div className="max-w-md p-8 bg-white border border-gray-100 rounded-xl shadow-premium">
                    <h2 className="font-oswald text-2xl mb-4 text-[#EF4444] uppercase">Profil Introuvable</h2>
                    <p className="text-gray-500 mb-6 font-light">
                        Nous n'avons pas pu charger les informations de votre profil. Veuillez vous reconnecter.
                    </p>
                    <button
                        onClick={async () => {
                            await logout();
                            window.location.href = '/';
                        }}
                        className="bg-derma-black text-white px-8 py-3 rounded text-xs uppercase tracking-widest hover:bg-derma-gold transition-colors"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
