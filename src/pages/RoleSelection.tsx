import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { upgradeToRole } from '@/lib/roleUpgrade';

const RoleSelection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'buyer' | null>(null);
  const { user, userRole, isLoading: authLoading, refreshRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (!authLoading && user && (userRole === 'freelancer' || userRole === 'buyer')) {
      navigate(userRole === 'freelancer' ? '/freelancer/dashboard' : '/buyer/dashboard');
    }
  }, [user, userRole, authLoading, navigate]);

  const handleRoleSelect = async (role: 'freelancer' | 'buyer') => {
    if (!user) return;
    setSelectedRole(role);
    setIsLoading(true);

    try {
      await upgradeToRole(user.id, role);
      await refreshRole();

      toast({ title: 'Role Selected!', description: `You joined as a ${role}.` });
      navigate(`/complete-profile/${role}`);
    } catch (err: any) {
      console.error('Role selection error:', err);
      toast({ title: 'Error', description: 'Could not set your role. Please try again.', variant: 'destructive' });
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <p className="mb-3 text-sm font-semibold text-primary">Welcome to Fivesom</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">What would you like to do?</h1>
          <p className="text-muted-foreground text-lg">Start by hiring talent or selling your skills. You can add another role later.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Freelancer Card */}
          <button
            onClick={() => handleRoleSelect('freelancer')}
            disabled={isLoading}
            className="group rounded-lg border border-border bg-card p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl disabled:opacity-60"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-3">Freelancer</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Create professional services, meet clients, and earn on Fivesom.
            </p>
            <ul className="space-y-2 mb-8 text-muted-foreground text-sm">
               <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" />Create and manage gigs</li>
               <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" />Set your own packages</li>
               <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" />Build your reputation</li>
            </ul>
            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold">
              {isLoading && selectedRole === 'freelancer' ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>Continue as Freelancer <ArrowRight className="w-4 h-4" /></>
              )}
            </div>
          </button>

          {/* Buyer Card */}
          <button
            onClick={() => handleRoleSelect('buyer')}
            disabled={isLoading}
            className="group rounded-lg border border-border bg-card p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl disabled:opacity-60"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-transform group-hover:scale-105">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-3">Buyer</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Hire skilled freelancers and get your work done easily.
            </p>
            <ul className="space-y-2 mb-8 text-muted-foreground text-sm">
               <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" />Browse skilled freelancers</li>
               <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" />Pay through secure checkout</li>
               <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" />Track orders and delivery</li>
            </ul>
            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-secondary text-secondary-foreground font-semibold group-hover:bg-accent">
              {isLoading && selectedRole === 'buyer' ? (
                <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
              ) : (
                <>Continue as Buyer <ArrowRight className="w-4 h-4" /></>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
