import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { upgradeToRole, NEED_BUYER_MESSAGE } from '@/lib/roleUpgrade';

interface UpgradeRoleProps {
  role: 'buyer' | 'freelancer';
}

const COPY = {
  buyer: {
    icon: Users,
    title: 'Complete Your Buyer Dashboard',
    subtitle: NEED_BUYER_MESSAGE,
    gradient: 'from-purple-500 to-pink-500',
    cta: 'Continue as Buyer',
    benefits: [
      'Order any gig securely with escrow protection',
      'Chat directly with freelancers',
      'Track your orders and deliveries',
      'Leave reviews after every order',
    ],
  },
  freelancer: {
    icon: Briefcase,
    title: 'Become a Freelancer on FIVESOM',
    subtitle: 'Start selling your services and earning money.',
    gradient: 'from-cyan-500 to-blue-500',
    cta: 'Continue as Freelancer',
    benefits: [
      'Create and manage your own gigs',
      'Set your own prices and packages',
      'Get paid securely to your Fivesom wallet',
      'Build your reputation with reviews and badges',
    ],
  },
} as const;

const UpgradeRole = ({ role }: UpgradeRoleProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, isLoading: authLoading, refreshRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const copy = COPY[role];
  const Icon = copy.icon;

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!authLoading && userRole === role) {
      navigate(role === 'freelancer' ? '/freelancer/dashboard' : '/buyer/dashboard', { replace: true });
    }
  }, [authLoading, userRole, role, navigate]);

  const handleUpgrade = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await upgradeToRole(user.id, role);
      await refreshRole();
      toast({ title: 'All set!', description: `You are now a ${role}.` });
      navigate(`/complete-profile/${role}`, { replace: true });
    } catch (err) {
      console.error('upgradeToRole error:', err);
      toast({ title: 'Error', description: 'Could not update your account. Please try again.', variant: 'destructive' });
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-xl bg-card rounded-2xl p-8 shadow-xl border border-border">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${copy.gradient} flex items-center justify-center mb-6`}>
            <Icon className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">{copy.title}</h1>
          <p className="text-muted-foreground mb-6">{copy.subtitle}</p>

          <ul className="space-y-3 mb-8">
            {copy.benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          <Button className="w-full" size="lg" onClick={handleUpgrade} disabled={isLoading}>
            {isLoading ? 'Please wait…' : copy.cta}
            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            No thanks, keep browsing
          </button>
        </div>
      </div>
    </>
  );
};

export default UpgradeRole;
