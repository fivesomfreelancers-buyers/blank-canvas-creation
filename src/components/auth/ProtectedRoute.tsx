import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useAccountState } from '@/hooks/useAccountState';
import { Button } from '@/components/ui/button';


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
  const { user, isLoading } = useAuth();
  const { isAdmin } = useAdminRole();
  const location = useLocation();
  const { state, error: stateError, isLoading: stateLoading, refresh } = useAccountState();
  const retryCount = useRef(0);

  useEffect(() => {
    if (!user || !stateError || state || retryCount.current >= 2) return;
    retryCount.current += 1;
    const retryTimer = window.setTimeout(() => { void refresh(); }, retryCount.current * 500);
    return () => window.clearTimeout(retryTimer);
  }, [user, stateError, state, refresh]);

  useEffect(() => {
    retryCount.current = 0;
  }, [user?.id]);

  // 1. Session still resolving → render nothing private.
  if (isLoading) return <Spinner />;

  // 2. No valid session → login.
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (require === 'authenticated') return <>{children}</>;

  // 3. Admins are allowed everywhere (monitoring/support).
  if (isAdmin) return <>{children}</>;

  // 4. The database decides: identity, account type and setup completion.
  if (stateLoading) return <Spinner />;

  // Never guess from browser state or a second role query. Retry brief network
  // failures, then provide a manual retry without rendering a private screen.
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-sm text-center">
          <p className="font-semibold text-foreground">We couldn't verify your account access.</p>
          <p className="mt-2 text-sm text-muted-foreground">Your account data is safe. Please check your connection and try again.</p>
          <Button type="button" variant="link" className="mt-3" onClick={() => void refresh()}>
            Try again
          </Button>
          {stateError ? <span className="sr-only">Account verification request failed.</span> : null}
        </div>
      </div>
    );
  }

  if (!state.emailVerified) return <Navigate to="/verify-email" replace />;

  // 5. No account type chosen yet → the single role-selection screen.
  if (!state.selectedRole) return <Navigate to="/select-role" replace />;

  // 6. Required setup form unfinished → finish it before any dashboard.
  if (state.onboardingStatus !== 'complete') {
    return <Navigate to={`/register/${state.selectedRole}`} replace />;
  }

  // 7. Wrong role → their own dashboard, never this one.
  if (state.selectedRole !== require) {
    return <Navigate to={state.selectedRole === 'freelancer' ? '/freelancer/dashboard' : '/buyer/dashboard'} replace />;
  }

  return <>{children}</>;

};

export default ProtectedRoute;
