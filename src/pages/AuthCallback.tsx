import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ensureNormalUserRole } from '@/lib/roleUpgrade';

/**
 * Google/OAuth landing page.
 *
 * The OAuth broker can hand the session back in several shapes:
 *   1. #access_token=...&refresh_token=...   (implicit / web_message redirect)
 *   2. ?access_token=...&refresh_token=...   (query variant)
 *   3. ?code=...                             (PKCE code exchange)
 *   4. nothing at all — the popup flow already called setSession()
 *
 * The old version only handled (3) plus a single immediate getSession(), so any
 * other shape (or a session that had not been persisted yet) produced a false
 * "Could not authenticate" error. We now handle every shape and wait for the
 * auth state to settle before declaring failure.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('Processing your sign-in...');

  useEffect(() => {
    let cancelled = false;

    const readParams = () => {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const get = (key: string) => query.get(key) || hash.get(key);
      return {
        code: get('code'),
        accessToken: get('access_token'),
        refreshToken: get('refresh_token'),
        error: get('error'),
        errorCode: get('error_code'),
        errorDescription: get('error_description'),
      };
    };

    // Turn provider/server errors into something a user can act on.
    const friendlyMessage = (raw?: string | null, code?: string | null) => {
      const text = `${code || ''} ${raw || ''}`.toLowerCase();
      if (text.includes('unexpected_failure') || text.includes('500') || text.includes('server_error')) {
        return 'Sign-in service is temporarily unavailable. Please wait a moment and try again.';
      }
      if (text.includes('access_denied') || text.includes('cancel')) {
        return 'Sign-in was cancelled. Please try again to continue.';
      }
      if (text.includes('redirect') || text.includes('invalid request')) {
        return 'This sign-in link is no longer valid. Please start the sign-in again.';
      }
      return raw || 'We could not complete your sign-in. Please try again.';
    };


    // Strip tokens from the address bar as soon as they are consumed.
    const cleanUrl = () => {
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    const waitForSession = async (timeoutMs = 8000) => {
      const started = Date.now();
      while (!cancelled && Date.now() - started < timeoutMs) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) return data.session;
        await new Promise((r) => setTimeout(r, 300));
      }
      const { data } = await supabase.auth.getSession();
      return data.session ?? null;
    };

    const handleCallback = async () => {
      try {
        const params = readParams();

        // Provider-side rejection (consent denied, server error, ...).
        if (params.error || params.errorCode) {
          console.error('OAuth provider error:', params.errorCode, params.errorDescription);
          throw new Error(friendlyMessage(params.errorDescription || params.error, params.errorCode));
        }


        if (params.accessToken && params.refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: params.accessToken,
            refresh_token: params.refreshToken,
          });
          cleanUrl();
          if (error) throw error;
        } else if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          cleanUrl();
          // A code that was already exchanged (double mount / refresh) is not
          // fatal as long as a session exists — fall through to the wait below.
          if (error && !(await supabase.auth.getSession()).data.session) {
            throw error;
          }
        }

        const session = await waitForSession();
        if (cancelled) return;

        if (!session?.user) {
          setStatus('Authentication failed. Redirecting...');
          toast({
            title: 'Login Failed',
            description: 'We could not complete your Google sign-in. Please try again.',
            variant: 'destructive',
          });
          setTimeout(() => navigate('/login', { replace: true }), 1800);
          return;
        }

        const user = session.user;

        const { data: roleRows } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const roles: string[] = (roleRows || []).map((r: any) => r.role);

        if (roles.includes('admin') || roles.includes('super_admin')) {
          toast({ title: 'Welcome, Admin!', description: 'Redirecting to admin dashboard.' });
          navigate('/admin', { replace: true });
          return;
        }

        if (roles.includes('freelancer')) {
          toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
          navigate('/freelancer/dashboard', { replace: true });
          return;
        }

        if (roles.includes('buyer')) {
          toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
          navigate('/buyer/dashboard', { replace: true });
          return;
        }

        // No buyer/freelancer role yet → stay a normal user and browse freely.
        setStatus('Setting up your account...');
        try {
          await ensureNormalUserRole(user.id);
        } catch (roleErr) {
          // Never block a valid session on a role bootstrap hiccup.
          console.error('ensureNormalUserRole error:', roleErr);
        }
        toast({
          title: 'Welcome to FIVESOM!',
          description: 'Explore services freely. You can become a buyer or freelancer anytime.',
        });
        navigate('/', { replace: true });
      } catch (err: any) {
        console.error('Auth callback error:', err);
        if (cancelled) return;
        // If a session did land despite the error, keep the user signed in.
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          navigate('/', { replace: true });
          return;
        }
        setStatus('Authentication failed. Redirecting...');
        toast({
          title: 'Login Failed',
          description: err?.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/login', { replace: true }), 1800);
      }
    };

    handleCallback();
    return () => {
      cancelled = true;
    };
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
