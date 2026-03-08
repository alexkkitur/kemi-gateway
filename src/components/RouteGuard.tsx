import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { UserRole, roleRoutePrefixes } from '@/lib/mock-data';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to the user's own dashboard
    const prefix = roleRoutePrefixes[user.role]?.[0] || '/';
    return <Navigate to={`${prefix}/dashboard`} replace />;
  }

  return <>{children}</>;
}
