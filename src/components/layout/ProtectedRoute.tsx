import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'client') {
      return <Navigate to="/client/dashboard" replace />;
    } else if (currentUser.role === 'freelancer') {
      return <Navigate to="/freelancer/dashboard" replace />;
    } else if (currentUser.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <Outlet />;
};
