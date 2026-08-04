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


const Login = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const routeAfterLogin = async (userId: string) => {
    const { data: roleRow } = await (supabase as any)
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    let resolvedRole = normalizeRole(roleRow?.role);

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

    if (resolvedRole === 'freelancer') navigate('/freelancer/dashboard');
    else if (resolvedRole === 'buyer') navigate('/buyer/dashboard');
    else navigate('/');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast({ title: 'Login Failed', description: 'Enter a valid email and password.', variant: 'destructive' });
      return;
    }

    setEmailLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      toast({
        title: 'Login Failed',
        description: error?.message || 'Could not authenticate. Please try again.',
        variant: 'destructive',
      });
      setEmailLoading(false);
      return;
    }

    toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
    await routeAfterLogin(data.user.id);
    setEmailLoading(false);
  };

  return (
    <>
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

                <Button type="submit" className="w-full h-12 font-semibold" disabled={emailLoading || googleLoading}>
                  {emailLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    'Sign in with Email'
                  )}
                </Button>
              </form>

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
