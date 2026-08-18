import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useProfileComplete } from '@/hooks/useProfileComplete';


type Requirement = 'authenticated' | 'freelancer' | 'buyer';

interface Props {
  children: React.ReactNode;
  /**
   * 'authenticated' — any signed-in account (shared flows such as payment).
   * 'freelancer' / 'buyer' — the account must actually hold that role.
   */
  require?: Requirement;
}

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Checking your access…</p>
    </div>
  </div>
);

/**
 * Route-level authentication + authorization gate.
 *
 * Nothing private renders until BOTH the session and the role have been
 * resolved, so a private dashboard can never flash for an unauthorized visitor
 * that typed/bookmarked/shared the URL. Row Level Security in Postgres is the
 * second, authoritative layer — this guard only decides what to render.
 */
const ProtectedRoute: React.FC<Props> = ({ children, require = 'authenticated' }) => {
  const { user, userRole, isLoading } = useAuth();
  const { isAdmin, isAdminResolved } = useAdminRole();
  const location = useLocation();

  // 1. Session still resolving → render nothing private.
  if (isLoading) return <Spinner />;

  // 2. No valid session → login.
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (require === 'authenticated') return <>{children}</>;

  // 3. Admins are allowed everywhere (monitoring/support).
  if (isAdmin) return <>{children}</>;

  // 4. Role not resolved yet → keep waiting instead of guessing.
  if (userRole === null && !isAdminResolved) return <Spinner />;

  // 5. Wrong role → send them to the right entry point, never render.
  if (userRole !== require) {
    if (userRole === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />;
    if (userRole === 'buyer') return <Navigate to="/buyer/dashboard" replace />;
    // Normal member: offer the proper authenticated upgrade flow.
    return <Navigate to={require === 'freelancer' ? '/become-freelancer' : '/become-buyer'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
