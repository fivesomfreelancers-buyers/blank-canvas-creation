import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import logo from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';
import { authCooldownRemaining, clearAuthFailures, cooldownMessage, recordAuthFailure } from '@/lib/authThrottle';
import SEO from '@/components/SEO';



const Login = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const normalizeRole = (role: unknown) => {
    return role === 'freelancer' || role === 'buyer' ? role : null;
  };

  // Redirect if already logged in
  useEffect(() => {
    if (emailLoading || googleLoading) return;

    if (!authLoading && user) {
      if (userRole === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else if (userRole === 'buyer') {
        navigate('/buyer/dashboard');
      } else {
        // Normal user — free to browse the marketplace
        navigate('/');
      }
    }
  }, [user, userRole, authLoading, navigate, emailLoading, googleLoading]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const redirectTo = new URL('/auth/callback', window.location.origin).toString();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { access_type: 'offline', prompt: 'consent' },
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('Google did not return a valid sign-in URL.');

      window.location.assign(data.url);
    } catch (error: unknown) {
      const authError = error instanceof Error ? error : new Error(String(error));
      const codedError = error as { code?: string; error_code?: string };
      const raw = `${codedError.code || codedError.error_code || ''} ${authError.message}`.toLowerCase();
      const description = raw.includes('unexpected_failure') || raw.includes('500') || raw.includes('server')
        ? 'Google sign-in is temporarily unavailable because the authentication callback failed. Please try again shortly.'
        : authError.message || 'Could not sign in with Google. Please try again.';
      toast({ title: 'Sign-in Failed', description, variant: 'destructive' });
      setGoogleLoading(false);
    }
  };


  const routeAfterLogin = async (userId: string) => {
    // A user can hold several role rows — never use maybeSingle() here.
    const { data: roleRows } = await (supabase as any)
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const roles: string[] = (roleRows || []).map((r: any) => r.role);

    if (roles.includes('admin') || roles.includes('super_admin')) {
      navigate('/admin', { replace: true });
      return;
    }

    let resolvedRole = roles.includes('freelancer')
      ? 'freelancer'
      : roles.includes('buyer')
        ? 'buyer'
        : null;

    if (!resolvedRole) {
      const { data: userRes } = await supabase.auth.getUser();
      const metadataRole = normalizeRole(userRes.user?.user_metadata?.role);
      if (metadataRole) {
        await (supabase as any).from('user_roles').upsert(
          { user_id: userId, role: metadataRole },
          { onConflict: 'user_id,role' }
        );
        resolvedRole = metadataRole;
      }
    }

    if (resolvedRole === 'freelancer') navigate('/freelancer/dashboard', { replace: true });
    else if (resolvedRole === 'buyer') navigate('/buyer/dashboard', { replace: true });
    else navigate('/', { replace: true });
  };


  // Real resend of the verification email.
  // Goes through the secure edge function, which mints an auth link and hands it
  // to the verified fivesom.net sender — success is only reported when the email
  // provider actually accepted the message.
  const handleResendVerification = async () => {
    const target = email.trim();
    if (!target) {
      toast({ title: 'Email required', description: 'Enter your email address first.', variant: 'destructive' });
      return;
    }
    setResendLoading(true);
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: { email: target, redirect_to: new URL('/auth/callback', window.location.origin).toString() },
    });
    setResendLoading(false);

    let failure: string | null = null;
    if (error) {
      const ctx = (error as any)?.context;
      let detail = '';
      try { detail = ctx && typeof ctx.text === 'function' ? await ctx.text() : ''; } catch { detail = ''; }
      try { failure = detail ? (JSON.parse(detail).error ?? detail) : null; } catch { failure = detail || null; }
      failure = failure || error.message || 'The email service rejected the request.';
    } else if (!data?.sent) {
      failure = (data as any)?.error || 'The email service did not confirm delivery.';
    }

    if (failure) {
      toast({ title: 'Could not send verification email', description: failure, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Verification email sent',
      description: `Delivered to ${target} (provider ref ${data.provider_id ?? 'n/a'}). Check your inbox and spam folder.`,
    });
  };


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast({ title: 'Login Failed', description: 'Enter a valid email and password.', variant: 'destructive' });
      return;
    }

    // Brute-force guard: escalating cooldown after repeated failures.
    const wait = authCooldownRemaining('login', email);
    if (wait > 0) {
      toast({ title: 'Too many attempts', description: cooldownMessage(wait), variant: 'destructive' });
      return;
    }

    setEmailLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      const raw = `${(error as any)?.code || ''} ${error?.message || ''}`.toLowerCase();
      const unconfirmed = raw.includes('not confirmed') || raw.includes('email_not_confirmed');
      setNeedsVerification(unconfirmed);

      const cooldown = unconfirmed ? 0 : recordAuthFailure('login', email);
      toast({
        title: unconfirmed ? 'Email not verified' : 'Login Failed',
        description: unconfirmed
          ? 'Confirm your email address first, then sign in. You can resend the verification email below.'
          : cooldown > 0
            ? cooldownMessage(cooldown)
            : error?.message || 'Could not authenticate. Please try again.',
        variant: 'destructive',
      });
      setEmailLoading(false);
      return;
    }

    clearAuthFailures('login', email);
    setNeedsVerification(false);
    toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
    await routeAfterLogin(data.user.id);
    setEmailLoading(false);
  };



  return (
    <>
      <SEO title="Log In to FIVESOM" description="Log in to your FIVESOM account to manage orders, messages, gigs and payouts." canonical="/login" noindex />
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 sm:space-x-3">
              <img
                src={logo}
                alt="FIVESOM Logo"
                width="50"
                height="50"
                className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] object-contain cursor-pointer"
              />
              <span className="text-xl sm:text-2xl font-bold text-foreground">FIVESOM</span>
            </Link>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Welcome back! Sign in to your account.</p>
          </div>

          {/* Login Card */}
          <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-xl border border-border">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-xl font-semibold text-foreground mb-2">Sign In</h1>
                <p className="text-sm text-muted-foreground">Use Google or email and password to continue</p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-10"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-10"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium">
                    Forgot password?
                  </Link>
                </div>


                <Button type="submit" className="w-full h-12 font-semibold" disabled={emailLoading || googleLoading}>
                  {emailLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    'Sign in with Email'
                  )}
                </Button>
              </form>

              {needsVerification && (
                <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Your email address is not verified yet. We can send the verification link again to{' '}
                    <span className="font-medium text-foreground">{email.trim()}</span>.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full h-11 font-semibold"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                  >
                    {resendLoading ? 'Sending…' : 'Resend verification email'}
                  </Button>
                </div>
              )}


              <div className="relative flex items-center justify-center">
                <div className="absolute inset-x-0 top-1/2 border-t border-border" />
                <span className="relative bg-card px-3 text-xs uppercase text-muted-foreground">or</span>
              </div>

              <Button
                onClick={handleGoogleLogin}
                disabled={googleLoading || emailLoading}
                variant="outline"
                className="w-full h-12 font-semibold transition-all flex items-center justify-center space-x-3 border-border hover:bg-accent"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="mt-6 sm:mt-8 pt-6 border-t border-border">
              <p className="text-center text-muted-foreground text-sm sm:text-base">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:text-primary/80 font-medium">
                  Join here
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
