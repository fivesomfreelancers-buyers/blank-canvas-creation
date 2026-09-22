import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { readOnboardingDraft } from '@/lib/onboardingDraft';

/**
 * Shown whenever a signed-in account tries to reach a buyer/freelancer area
 * before its email address has been confirmed. This screen only explains the
 * situation — the database refuses the same actions regardless of what the
 * browser does.
 */
const VerifyEmail = () => {
  const { user, emailVerified, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  const email = user?.email ?? '';

  const resend = async () => {
    if (!email) return;
    setSending(true);
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: { email, redirect_to: new URL('/auth/callback', window.location.origin).toString() },
    });
    setSending(false);
    if (error || !data?.sent) {
      toast({
        title: 'Could not send the email',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Verification email sent', description: `Check the inbox for ${email}.` });
  };

  const recheck = async () => {
    setChecking(true);
    const { data } = await supabase.auth.refreshSession();
    setChecking(false);
    if (data.user?.email_confirmed_at) {
      const pending = readOnboardingDraft();
      navigate(pending ? `/register/${pending.role}` : '/select-role', { replace: true });
      return;
    }
    toast({
      title: 'Not confirmed yet',
      description: 'Open the link in your email first, then check again.',
      variant: 'destructive',
    });
  };

  useEffect(() => {
    if (!isLoading && emailVerified) {
      const pending = readOnboardingDraft();
      navigate(pending ? `/register/${pending.role}` : '/select-role', { replace: true });
    }
  }, [isLoading, emailVerified, navigate]);

  return (
    <>
      <SEO title="Verify Your Email | Fivesom" description="Confirm your email address to continue on Fivesom." canonical="/verify-email" noindex />
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-xl backdrop-blur-lg animate-fade-in">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MailCheck className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-card-foreground">Confirm your email address</h1>
          <p className="mb-6 text-muted-foreground">
            {email
              ? <>We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Open it to continue.</>
              : 'Open the confirmation link we sent you to continue.'}
          </p>

          <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            Until your email is confirmed you can browse Fivesom, but you cannot open a buyer or freelancer account, publish services or place orders.
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={recheck} disabled={checking}>
              <RefreshCw className={`mr-2 h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking…' : "I've confirmed my email"}
            </Button>
            <Button variant="secondary" className="w-full" size="lg" onClick={resend} disabled={sending || !email}>
              {sending ? 'Sending…' : 'Send the email again'}
            </Button>
            <Link to="/" className="block pt-1 text-center text-sm text-muted-foreground transition-colors hover:text-foreground">
              Keep browsing for now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
