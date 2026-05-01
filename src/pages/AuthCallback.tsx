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

        // Check if user already has a role
        const { data: existingRole } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingRole?.role) {
          // Existing user with role — go to dashboard
          toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
          navigate(existingRole.role === 'freelancer' ? '/freelancer/dashboard' : '/buyer/dashboard');
          return;
        }

        // New user without role — go to role selection
        setStatus('Setting up your account...');
        toast({ title: 'Welcome!', description: 'Please choose how you want to use FIVSOM.' });
        navigate('/select-role');
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
