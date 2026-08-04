import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import logo from '@/assets/logo.png';

/**
 * Public route. Supabase delivers the recovery session either through the URL
 * hash (implicit flow) or a `code` query param (PKCE), so we wait for the
 * PASSWORD_RECOVERY / SIGNED_IN event before enabling the form.
 */
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setReady(true);
        setChecking(false);
      }
    });

    const bootstrap = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch {
          /* handled below via session check */
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setReady(!!session);
      setChecking(false);
    };

    bootstrap();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Passwords do not match', description: 'Please retype the same password.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: 'Could not update password', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Password updated', description: 'You can now use your new password.' });
    navigate('/', { replace: true });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 sm:space-x-3">
              <img src={logo} alt="FIVESOM Logo" width="50" height="50" className="w-[50px] h-[50px] object-contain" />
              <span className="text-xl sm:text-2xl font-bold text-foreground">FIVESOM</span>
            </Link>
          </div>

          <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-xl border border-border">
            <h1 className="text-xl font-semibold text-foreground mb-6 text-center">Set a new password</h1>

            {checking ? (
              <p className="text-center text-sm text-muted-foreground">Verifying your reset link...</p>
            ) : !ready ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  This reset link is invalid or has expired. Request a new one.
                </p>
                <Button asChild className="w-full h-12">
                  <Link to="/forgot-password">Request a new link</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-10"
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-foreground font-medium">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="h-12 pl-10"
                      placeholder="Retype your password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
                  {loading ? 'Updating...' : 'Update password'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
