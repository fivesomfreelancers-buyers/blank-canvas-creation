import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Check,
  FolderKanban,
  Handshake,
  Search,
  ShoppingBag,
  Sparkles,
  Wallet,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { upgradeToRole } from '@/lib/roleUpgrade';

type Role = 'freelancer' | 'buyer';

const OPTIONS: Array<{
  role: Role;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  icon: typeof Briefcase;
  points: Array<{ icon: typeof Check; label: string }>;
  accent: string;
  ring: string;
  iconBg: string;
  button: string;
}> = [
  {
    role: 'freelancer',
    eyebrow: 'I want to sell my skills',
    title: 'Become a Freelancer',
    description: 'Sell your skills, create gigs, find clients and grow your freelance career.',
    cta: 'Continue as Freelancer',
    icon: Briefcase,
    points: [
      { icon: Sparkles, label: 'Show your skills and portfolio' },
      { icon: FolderKanban, label: 'Create and manage your gigs' },
      { icon: Award, label: 'Win clients and build your reputation' },
      { icon: Wallet, label: 'Get paid securely to your wallet' },
    ],
    accent: 'from-primary/20 via-primary/5 to-transparent',
    ring: 'hover:border-primary/70 focus-visible:border-primary',
    iconBg: 'bg-primary/10 text-primary',
    button: 'bg-primary text-primary-foreground',
  },
  {
    role: 'buyer',
    eyebrow: 'I want to hire someone',
    title: 'Hire a Freelancer',
    description: 'Find skilled professionals, hire freelancers and get your projects completed.',
    cta: 'Continue as Buyer',
    icon: ShoppingBag,
    points: [
      { icon: Search, label: 'Find the right talent fast' },
      { icon: Handshake, label: 'Hire with escrow protection' },
      { icon: FolderKanban, label: 'Track projects and deliveries' },
      { icon: BadgeCheck, label: 'Review the work you receive' },
    ],
    accent: 'from-secondary/40 via-secondary/10 to-transparent',
    ring: 'hover:border-foreground/40 focus-visible:border-foreground/50',
    iconBg: 'bg-secondary text-secondary-foreground',
    button: 'bg-secondary text-secondary-foreground',
  },
];

/**
 * The single place where a freshly authenticated account picks how it will use
 * Fivesom. The choice is written to the database (user_roles), which only
 * accepts it for accounts with a confirmed identity — the browser cannot grant
 * itself a role.
 */
const RoleSelection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { user, userRole, emailVerified, isLoading: authLoading, refreshRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    // Identity must be confirmed before any role can be chosen.
    if (!emailVerified) {
      navigate('/verify-email', { replace: true });
      return;
    }
    // Existing buyers/freelancers keep their role and go straight to work.
    if (userRole === 'freelancer' || userRole === 'buyer') {
      navigate(userRole === 'freelancer' ? '/freelancer/dashboard' : '/buyer/dashboard', { replace: true });
    }
  }, [user, userRole, emailVerified, authLoading, navigate]);

  const handleRoleSelect = async (role: Role) => {
    if (!user || isLoading) return;
    setSelectedRole(role);
    setIsLoading(true);

    try {
      await upgradeToRole(user.id, role);
      await refreshRole();
      toast({
        title: role === 'freelancer' ? 'Welcome, freelancer!' : 'Welcome, buyer!',
        description: 'Let’s finish setting up your account.',
      });
      navigate(`/complete-profile/${role}`, { replace: true });
    } catch (err) {
      console.error('Role selection error:', err);
      toast({
        title: 'Could not save your choice',
        description: 'Please confirm your email address and try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Choose How You Use Fivesom" description="Join Fivesom as a freelancer to sell your skills, or as a buyer to hire skilled freelancers." canonical="/select-role" noindex />
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4 pb-16 pt-28">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-10 text-center animate-fade-in">
            <p className="mb-3 text-sm font-semibold text-primary">Welcome to Fivesom</p>
            <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">How would you like to use Fivesom?</h1>
            <p className="text-lg text-muted-foreground">Pick one to get started. You can always add the other later.</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 md:gap-8">
            {OPTIONS.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.role;
              const isDimmed = isLoading && !isSelected;

              return (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => handleRoleSelect(option.role)}
                  disabled={isLoading}
                  aria-pressed={isSelected}
                  style={{ animationDelay: `${index * 90}ms` }}
                  className={[
                    'group relative overflow-hidden rounded-2xl border border-border bg-card p-7 text-left shadow-sm',
                    'animate-fade-in transition-all duration-300 ease-out will-change-transform',
                    'hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                    option.ring,
                    isSelected ? 'border-primary shadow-xl ring-2 ring-primary/40 -translate-y-1' : '',
                    isDimmed ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  <div
                    className={`pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b ${option.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`}
                  />

                  <div className="relative">
                    <div className="mb-5 flex items-center justify-between">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${option.iconBg} transition-transform duration-300 group-hover:scale-105`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      {isSelected && (
                        <span className="flex h-8 w-8 animate-scale-in items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>

                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{option.eyebrow}</p>
                    <h2 className="mb-2 text-2xl font-bold text-card-foreground">{option.title}</h2>
                    <p className="mb-6 leading-relaxed text-muted-foreground">{option.description}</p>

                    <ul className="mb-8 space-y-2.5 text-sm text-muted-foreground">
                      {option.points.map((point) => {
                        const PointIcon = point.icon;
                        return (
                          <li key={point.label} className="flex items-center gap-3">
                            <PointIcon className="h-4 w-4 flex-shrink-0 text-primary" />
                            {point.label}
                          </li>
                        );
                      })}
                    </ul>

                    <div className={`flex w-full items-center justify-center gap-2 rounded-md py-3 font-semibold transition-transform duration-300 group-hover:scale-[1.02] ${option.button}`}>
                      {isSelected && isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                      ) : (
                        <>
                          {option.cta}
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoleSelection;
