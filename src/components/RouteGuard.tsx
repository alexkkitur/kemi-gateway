import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleRoutePrefixes: Record<AppRole, string> = {
  student: '/student',
  admission_officer: '/admin',
  dd_aec: '/approver',
  dd_cdt: '/authorizer',
  super_admin: '/admin',
};

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles: AppRole[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const prefix = roleRoutePrefixes[user.role] || '/';
    return <Navigate to={`${prefix}/dashboard`} replace />;
  }

  return <>{children}</>;
}
