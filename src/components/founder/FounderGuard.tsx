import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, Loader2, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useFounderRole } from '@/hooks/useFounderRole';

/**
 * Gate for /founders. Access depends only on the `founder` role in
 * `public.user_roles` (managed from Supabase). No founder emails or passwords
 * live in the frontend, and bypassing this component grants nothing because
 * every founder read/write is also authorised in the database.
 */
const FounderGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { isFounder, isLoading } = useFounderRole();
  const navigate = useNavigate();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verifying founder access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Founder Access</CardTitle>
            <CardDescription>
              Sign in with your Fivesom account to open the Founder Dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" onClick={() => navigate('/login', { state: { from: '/founders' } })}>
              Sign In
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" /> Back to Site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isFounder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Restricted Area</CardTitle>
            <CardDescription>
              You're signed in as <span className="font-medium text-foreground">{user.email}</span>, which is not an
              authorized Fivesom founder account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" /> Back to Site
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default FounderGuard;
