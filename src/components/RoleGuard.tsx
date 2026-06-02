import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RoleGuardProps {
  allow: 'freelancer' | 'buyer' | Array<'freelancer' | 'buyer'>;
  children: ReactNode;
}

/**
 * Restricts access to a route based on the user's role.
 * - Unauthenticated users are sent to /login.
 * - Wrong-role users are redirected to their own dashboard.
 */
const RoleGuard = ({ allow, children }: RoleGuardProps) => {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowed = Array.isArray(allow) ? allow : [allow];

  // If role hasn't been assigned yet, send the user to pick one
  // instead of bouncing between guarded dashboards (which causes a blank screen).
  if (!userRole) {
    return <Navigate to="/select-role" replace />;
  }

  if (!allowed.includes(userRole)) {
    const fallback = userRole === 'buyer' ? '/buyer/dashboard' : '/freelancer/dashboard';
    if (location.pathname === fallback) {
      // Avoid redirecting to the same path we're already on.
      return <>{children}</>;
    }
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
