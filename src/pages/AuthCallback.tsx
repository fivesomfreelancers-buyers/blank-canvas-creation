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
        // Wait for session to be established
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session?.user) {
          setStatus('Authentication failed. Redirecting...');
          toast({ title: 'Login Failed', description: 'Could not authenticate. Please try again.', variant: 'destructive' });
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const user = session.user;
        const signupRole = localStorage.getItem('fivesom_signup_role') as 'freelancer' | 'buyer' | null;

        // Check if user already has a role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingRole?.role) {
          // Existing user — redirect to dashboard
          localStorage.removeItem('fivesom_signup_role');
          toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
          if (existingRole.role === 'freelancer') {
            navigate('/freelancer/dashboard');
          } else {
            navigate('/buyer/dashboard');
          }
          return;
        }

        // New user — assign role
        const role = signupRole || 'buyer';
        localStorage.removeItem('fivesom_signup_role');

        setStatus('Setting up your account...');

        // Create profile
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          email: user.email || '',
          role: role,
          profile_image_url: user.user_metadata?.avatar_url || null,
        }, { onConflict: 'id' } as any);

        // Create user_roles entry
        await supabase.from('user_roles').insert({
          user_id: user.id,
          role: role,
        } as any);

        // Create wallet
        await supabase.from('wallets').insert({
          user_id: user.id,
        } as any);

        // Create freelancer or buyer record
        if (role === 'freelancer') {
          await supabase.from('freelancers').insert({ user_id: user.id } as any);
        } else {
          await supabase.from('buyers').insert({ user_id: user.id } as any);
        }

        toast({ title: 'Account Created!', description: `Welcome to FIVESOM as a ${role}!` });

        // Redirect to profile completion
        if (role === 'freelancer') {
          navigate('/complete-profile/freelancer');
        } else {
          navigate('/complete-profile/buyer');
        }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
