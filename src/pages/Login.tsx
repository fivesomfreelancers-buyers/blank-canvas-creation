import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthShell from '@/components/auth/AuthShell';
import GoogleIcon from '@/components/auth/GoogleIcon';
import SEO from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { authCooldownRemaining, clearAuthFailures, cooldownMessage, recordAuthFailure } from '@/lib/authThrottle';
import { accountLandingPath, fetchAccountState } from '@/lib/accountState';

const Login = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || emailLoading || googleLoading || !user) return;
    fetchAccountState()
      .then((state) => navigate(accountLandingPath(state), { replace: true }))
      .catch(() => toast({ title: 'Could not load your account', description: 'Please check your connection and try again.', variant: 'destructive' }));
  }, [user, authLoading, emailLoading, googleLoading, navigate, toast]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: new URL('/auth/callback', window.location.origin).toString(),
          queryParams: { access_type: 'offline', prompt: 'consent' },
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data.url) throw new Error('Google did not return a valid sign-in URL.');
      window.location.assign(data.url);
    } catch (error) {
      setGoogleLoading(false);
      toast({ title: 'Sign-in failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    }
  };

  const routeAfterLogin = async () => {
    try {
      const state = await fetchAccountState();
      navigate(accountLandingPath(state), { replace: true });
    } catch {
      toast({ title: 'Could not load your account', description: 'Your sign-in succeeded. Please retry while we load your saved account.', variant: 'destructive' });
    }
  };

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast({ title: 'Sign-in failed', description: 'Enter a valid email and password.', variant: 'destructive' });
      return;
    }
    const wait = authCooldownRemaining('login', email);
    if (wait > 0) {
      toast({ title: 'Too many attempts', description: cooldownMessage(wait), variant: 'destructive' });
      return;
    }
    setEmailLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      const raw = `${error?.code || ''} ${error?.message || ''}`.toLowerCase();
      const unconfirmed = raw.includes('not confirmed') || raw.includes('email_not_confirmed');
      setNeedsVerification(unconfirmed);
      const cooldown = unconfirmed ? 0 : recordAuthFailure('login', email);
      toast({
        title: unconfirmed ? 'Email not verified' : 'Sign-in failed',
        description: unconfirmed ? 'Confirm your email first, then sign in.' : cooldown > 0 ? cooldownMessage(cooldown) : error?.message || 'Please try again.',
        variant: 'destructive',
      });
      setEmailLoading(false);
      return;
    }
    clearAuthFailures('login', email);
    await routeAfterLogin();
    setEmailLoading(false);
  };

  const resendVerification = async () => {
    if (!email.trim()) return;
    setResendLoading(true);
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: { email: email.trim(), redirect_to: new URL('/auth/callback', window.location.origin).toString() },
    });
    setResendLoading(false);
    toast(error || !data?.sent
      ? { title: 'Could not send the email', description: 'Please try again shortly.', variant: 'destructive' }
      : { title: 'Verification email sent', description: `Check the inbox for ${email.trim()}.` });
  };

  return (
    <>
      <SEO title="Log In to FIVESOM" description="Log in to your FIVESOM account to manage orders, messages, gigs and payouts." canonical="/login" noindex />
      <AuthShell eyebrow="Welcome back" title="Your work and projects are waiting." description="Sign in securely to manage your account, messages, orders, services and payments." benefits={['Direct access to your saved account', 'Secure role-based permissions', 'One place for work and messages']}>
        <div className="mb-7">
          <p className="text-sm font-semibold text-primary">Existing members</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">Log in to FIVESOM</h1>
          <p className="mt-3 text-muted-foreground">Use Google or your email and password to continue.</p>
        </div>

        <Button type="button" variant="outline" className="h-12 w-full bg-card font-semibold" onClick={handleGoogleLogin} disabled={googleLoading || emailLoading}>
          {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><GoogleIcon /><span className="ml-3">Continue with Google</span></>}
        </Button>
        <div className="relative my-6 flex items-center justify-center"><div className="absolute inset-x-0 border-t border-border" /><span className="relative bg-background px-4 text-xs font-semibold text-muted-foreground">OR</span></div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12" autoComplete="email" placeholder="you@example.com" required /></div>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">Forgot password?</Link></div>
            <div className="relative"><Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 pr-11" autoComplete="current-password" required /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-2 h-8 w-8" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div>
          </div>
          <Button type="submit" className="h-12 w-full font-semibold" disabled={emailLoading || googleLoading}>{emailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue<ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
        </form>

        {needsVerification && <div className="mt-5 rounded-md border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Your email is not verified yet.</p><Button type="button" variant="secondary" className="mt-3 w-full" onClick={resendVerification} disabled={resendLoading}>{resendLoading ? 'Sending…' : 'Resend verification email'}</Button></div>}

        <p className="mt-7 border-t border-border pt-6 text-center text-sm text-muted-foreground">New to FIVESOM? <Link to="/register" className="font-semibold text-primary hover:underline">Choose how you want to join</Link></p>
      </AuthShell>
    </>
  );
};

export default Login;