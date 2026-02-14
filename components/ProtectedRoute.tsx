import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
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

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Role not allowed, redirect to relevant dashboard or home
        const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
