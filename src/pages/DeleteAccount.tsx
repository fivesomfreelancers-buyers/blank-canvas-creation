import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, ShieldAlert, Mail, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SUPPORT_EMAIL } from '@/lib/support';

const DeleteAccount: React.FC = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    const meta: any = user?.user_metadata || {};
    if (meta.full_name || meta.name) setFullName(meta.full_name || meta.name);
  }, [user]);

  const mailtoFallback = () => {
    const subject = encodeURIComponent('Account deletion request — Fivesom');
    const body = encodeURIComponent(
      `Full name: ${fullName || '(not provided)'}\nAccount email: ${email || '(not provided)'}\n\nReason (optional): ${reason || '(not provided)'}\n\nI request permanent deletion of my Fivesom account and all associated personal data.`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const submit = async () => {
    const mail = email.trim();
    if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      return toast.error('Please enter the email address linked to your account.');
    }
    if (mail.length > 255 || fullName.length > 120 || reason.length > 1000) {
      return toast.error('One of the fields is too long.');
    }

    // Signed-out visitors (e.g. arriving from the Play Store listing) use email.
    if (!user) {
      mailtoFallback();
      setSent(true);
      return;
    }

    try {
      setSending(true);
      let convoId: string | null = null;
      const { data: existing } = await (supabase as any)
        .from('system_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'support')
        .maybeSingle();
      convoId = existing?.id ?? null;

      if (!convoId) {
        await (supabase as any).rpc('bootstrap_system_conversations', { _user_id: user.id });
        const { data: after } = await (supabase as any)
          .from('system_conversations')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'support')
          .maybeSingle();
        convoId = after?.id ?? null;
        if (!convoId) throw new Error('Could not open a support conversation.');
      }

      const body = [
        '🗑️ ACCOUNT DELETION REQUEST',
        '',
        `Full name: ${fullName.trim() || '(not provided)'}`,
        `Account email: ${mail}`,
        `User ID: ${user.id}`,
        '',
        `Reason: ${reason.trim() || '(not provided)'}`,
        '',
        'The user requests permanent deletion of their account and all associated personal data.',
      ].join('\n');

      const { error } = await (supabase as any).from('system_messages').insert({
        conversation_id: convoId,
        sender_type: 'user',
        sender_id: user.id,
        body,
      });
      if (error) throw error;

      setSent(true);
      toast.success('Deletion request submitted. Our team will confirm by email.');
    } catch (err: any) {
      toast.error(err.message || 'Could not submit the request. Please email us instead.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Delete Your Fivesom Account | Data Deletion Request"
        description="Request permanent deletion of your Fivesom account and all associated personal data, including profile, orders and message history."
        canonical="/delete-account"
      />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            Account &amp; Data Deletion
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Delete your Fivesom account</h1>
          <p className="text-muted-foreground">
            Fivesom (fivesom.net) lets you permanently delete your account and every piece of personal data
            connected to it. Submit the request below and our support team will process it.
          </p>
        </header>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">How to request deletion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ol className="space-y-2 list-decimal list-inside">
              <li>Enter the email address linked to your Fivesom account in the form below.</li>
              <li>Optionally tell us why you are leaving — this helps us improve.</li>
              <li>Press <span className="text-foreground font-medium">Request Deletion</span>.</li>
              <li>
                Our team verifies ownership of the account and emails you a confirmation once the deletion is
                complete.
              </li>
            </ol>
            <p>
              You can also email us directly at{' '}
              <a className="text-primary hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>{' '}
              with the subject “Account deletion request”.
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Trash2 className="w-4 h-4" />
              What gets permanently deleted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="text-foreground">
              By requesting deletion, all of your account data is permanently removed from our servers and cannot
              be recovered.
            </p>
            <ul className="grid sm:grid-cols-2 gap-2">
              {[
                'Profile information (name, photo, bio, location, languages, skills)',
                'Login credentials and authentication records',
                'Gigs, portfolio items and gig media',
                'Project and order history, requirements and deliveries',
                'Messages, chat attachments and support tickets',
                'Reviews, ratings and verification documents',
                'Wallet balance records, payout details and withdrawal history',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 rounded-lg border border-border/60 bg-muted/40 p-3">
              <Clock className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <p>
                Requests are completed within 30 days. A limited set of transaction records may be retained in
                anonymised form only where financial or tax law requires it. Active orders or pending payouts must
                be settled before deletion can be finalised.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Request deletion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Your deletion request has been submitted.
                </div>
                <p className="text-muted-foreground">
                  We will contact you at <span className="text-foreground">{email}</span> to confirm. If you do not
                  hear from us within 48 hours, email{' '}
                  <a className="text-primary hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
                <Button asChild variant="outline">
                  <Link to="/">Back to home</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="da-name">Full name (optional)</Label>
                  <Input
                    id="da-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name on Fivesom"
                    maxLength={120}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="da-email">Account email</Label>
                  <Input
                    id="da-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={255}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="da-reason">Reason (optional)</Label>
                  <Textarea
                    id="da-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell us why you want to delete your account…"
                    rows={4}
                    maxLength={1000}
                  />
                </div>
                <Button variant="destructive" className="w-full" onClick={submit} disabled={sending}>
                  {sending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {sending ? 'Submitting…' : 'Request Deletion'}
                </Button>
                <p className="text-xs text-muted-foreground flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {user
                    ? 'Your request is delivered straight to Fivesom Support, and you can follow up from your Messages inbox.'
                    : 'You are not signed in, so your email app will open with a pre-filled deletion request addressed to Fivesom Support.'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          For details on how we handle your data, read our{' '}
          <Link to="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link to="/legal/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default DeleteAccount;
