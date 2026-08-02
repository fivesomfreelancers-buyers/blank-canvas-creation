import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('Processing your sign-in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const authCode = new URLSearchParams(window.location.search).get('code');
        if (authCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
          if (exchangeError) throw exchangeError;
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session?.user) {
          setStatus('Authentication failed. Redirecting...');
          toast({ title: 'Login Failed', description: error?.message || 'Could not authenticate. Please try again.', variant: 'destructive' });
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const user = session.user;

        // Check if user already has any role(s)
        const { data: roleRows } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const roles: string[] = (roleRows || []).map((r: any) => r.role);

        if (roles.includes('admin') || roles.includes('super_admin')) {
          toast({ title: 'Welcome, Admin!', description: 'Redirecting to admin dashboard.' });
          navigate('/admin');
          return;
        }

        if (roles.includes('freelancer')) {
          toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
          navigate('/freelancer/dashboard');
          return;
        }

        if (roles.includes('buyer')) {
          toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
          navigate('/buyer/dashboard');
          return;
        }

        // No buyer/freelancer role yet → stay a normal user and browse freely.
        setStatus('Setting up your account...');
        await ensureNormalUserRole(user.id);
        toast({ title: 'Welcome to FIVESOM!', description: 'Explore services freely. You can become a buyer or freelancer anytime.' });
        navigate('/', { replace: true });

      } catch (err) {
        console.error('Auth callback error:', err);
        toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
