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

    const handleLogoutAndHome = async () => {
        await logout();
        window.location.href = '/';
    };

    console.log('ProtectedRoute: Checking access...', {
        path: location.pathname,
        isAuthenticated,
        isLoading,
        hasUser: !!user,
        userRole: user?.role
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#C0A76A]"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('ProtectedRoute: Not authenticated, redirecting...');
        const isAdminPath = location.pathname.startsWith('/admin');
        const loginPath = isAdminPath ? '/admin/login' : '/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // AUTHENTICATED BUT NO PROFILE FOUND
    if (!user) {
        console.warn('ProtectedRoute: Authenticated but NO PROFILE. Logging out...');
        handleLogoutAndHome();
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8]">
                <p className="text-gray-400 font-oswald uppercase tracking-widest text-[10px]">Session Error - Resetting...</p>
            </div>
        );
    }

    // STATUS HANDLING FOR PARTNERS
    if (user.role === 'PARTENAIRE') {
        const status = user.status?.toLowerCase();

        if (status !== 'approved' && status !== 'active') {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-derma-cream font-sans">
                    <div className="max-w-md w-full p-10 bg-white border border-derma-border rounded-lg shadow-premium text-center relative overflow-hidden">
                        {/* Gold accent bar */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-derma-gold opacity-60"></div>

                        <h2 className="font-oswald text-2xl mb-4 text-derma-black uppercase tracking-wider">
                            {status === 'pending' ? 'Demande en cours' : 'Accès Restreint'}
                        </h2>

                        <p className="text-gray-500 mb-8 font-light leading-relaxed">
                            {status === 'pending'
                                ? "Votre demande est en cours d'examen. Nous vous contacterons sous 48h."
                                : "Votre demande a été refusée. Contactez-nous pour plus d'informations."}
                        </p>

                        <button
                            onClick={handleLogoutAndHome}
                            className="w-full bg-derma-black text-white px-8 py-4 rounded text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-derma-gold transition-all duration-300 shadow-lg"
                        >
                            Retour à l'accueil
                        </button>

                        <div className="mt-8 pt-6 border-t border-derma-border opacity-20">
                            <h1 className="font-oswald text-xs uppercase tracking-[0.3em] text-derma-black">DERMAKOR</h1>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // ROLE CHECK
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
