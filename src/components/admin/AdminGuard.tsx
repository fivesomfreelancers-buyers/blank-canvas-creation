import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, KeyRound, Loader2, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { authCooldownRemaining, clearAuthFailures, cooldownMessage, recordAuthFailure } from '@/lib/authThrottle';


interface AdminGuardProps {
  children: React.ReactNode;
}

const checkAdminRole = async (userId: string): Promise<boolean> => {
  // Check both admin and super_admin via direct query (covers either role)
  const { data, error } = await (supabase as any)
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['admin', 'super_admin']);
  if (error) {
    console.error('checkAdminRole error:', error);
    return false;
  }
  return Array.isArray(data) && data.length > 0;
};

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const runCheck = useCallback(async () => {
    setChecking(true);
    const { data: { user: current } } = await supabase.auth.getUser();
    if (!current) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    const ok = await checkAdminRole(current.id);
    setIsAdmin(ok);
    setChecking(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    runCheck();
  }, [user?.id, authLoading, runCheck]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      runCheck();
    });
    return () => subscription.unsubscribe();
  }, [runCheck]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // The admin console is the highest-value target — throttle guesses hard.
    const wait = authCooldownRemaining('admin-login', email);
    if (wait > 0) {
      toast.error(cooldownMessage(wait));
      return;
    }

    setLoginLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        const cooldown = recordAuthFailure('admin-login', email);
        toast.error(cooldown > 0 ? cooldownMessage(cooldown) : error?.message || 'Login failed');
        setLoginLoading(false);
        return;
      }
      const ok = await checkAdminRole(data.user.id);
      if (!ok) {
        recordAuthFailure('admin-login', email);
        toast.error('Access denied. This account is not an admin.');
        await supabase.auth.signOut();
        setIsAdmin(false);
      } else {
        clearAuthFailures('admin-login', email);
        toast.success('Welcome, Admin!');
        setIsAdmin(true);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Login failed');
    }
    setLoginLoading(false);
  };


  const handleSignOut = async () => {
    await signOut();
    setIsAdmin(false);
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Logged in but not admin — show clear screen with sign-out, do not silently overwrite session
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Not an Admin Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              You're signed in as <span className="font-medium text-foreground">{user.email}</span>, which doesn't have admin access.
              Sign out and sign back in with your admin email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={handleSignOut} className="w-full" variant="destructive">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
            <Button onClick={() => navigate('/')} className="w-full" variant="outline">
              <Home className="h-4 w-4 mr-2" /> Back to Site
            </Button>
            <Button onClick={runCheck} className="w-full" variant="ghost">
              Re-check Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in — show admin login form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Admin Access</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
                ) : (
                  <><Lock className="h-4 w-4 mr-2" /> Sign In as Admin</>
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button onClick={() => navigate('/')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← Back to site
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
