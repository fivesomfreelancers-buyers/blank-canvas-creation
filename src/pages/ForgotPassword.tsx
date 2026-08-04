import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import logo from '@/assets/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast({ title: 'Could not send email', description: error.message, variant: 'destructive' });
      return;
    }

    setSent(true);
    toast({
      title: 'Check your email',
      description: 'We sent you a link to reset your password.',
    });
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
            <h1 className="text-xl font-semibold text-foreground mb-2 text-center">Reset your password</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            {sent ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-foreground">
                  A reset link is on its way to <span className="font-medium">{email}</span>. Open it on this device to
                  set a new password.
                </p>
                <Button asChild variant="outline" className="w-full h-12">
                  <Link to="/login">Back to sign in</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:text-primary/80 font-medium">Back to sign in</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
