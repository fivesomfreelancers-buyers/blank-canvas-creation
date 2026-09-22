import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Check, ShoppingBag } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import SEO from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { saveOnboardingDraft, type OnboardingRole } from '@/lib/onboardingDraft';
import { accountLandingPath, fetchAccountState } from '@/lib/accountState';

const choices = [
  {
    role: 'freelancer' as const,
    icon: BriefcaseBusiness,
    eyebrow: 'I want to sell my skills',
    title: 'Freelancer',
    statement: 'Sell Your Skills. Find Clients. Grow Your Career.',
    description: 'Create gigs, showcase your expertise and build trusted client relationships.',
    points: ['Create professional services', 'Connect with clients', 'Earn through secure orders'],
  },
  {
    role: 'buyer' as const,
    icon: ShoppingBag,
    eyebrow: 'I want to hire someone',
    title: 'Buyer',
    statement: 'Find Talent. Hire With Confidence. Get Things Done.',
    description: 'Find skilled freelancers, manage projects and receive work with confidence.',
    points: ['Search skilled professionals', 'Hire with escrow protection', 'Track projects and delivery'],
  },
];

const Register = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<OnboardingRole | null>(null);
  const [checkingAccount, setCheckingAccount] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setCheckingAccount(false);
      return;
    }
    // Signed-in accounts follow the account type stored on their account, so
    // this two-option screen is only for brand new visitors.
    setCheckingAccount(true);
    fetchAccountState()
      .then((state) => {
        const landing = accountLandingPath(state);
        if (landing !== '/select-role') navigate(landing, { replace: true });
        else setCheckingAccount(false);
      })
      .catch(() => setCheckingAccount(false));
  }, [user, isLoading, navigate]);

  const choose = (role: OnboardingRole) => {
    setSelected(role);
    saveOnboardingDraft({ role });
    window.setTimeout(() => navigate(`/register/${role}`), 180);
  };

  if (isLoading || (user && checkingAccount)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Join FIVESOM | Choose Freelancer or Buyer" description="Create a FIVESOM account as a freelancer selling skills or a buyer hiring professional talent." canonical="/register" noindex />
      <AuthShell eyebrow="Welcome to FIVESOM" title="One marketplace. Two clear ways to grow." description="Choose the path that matches what you want to accomplish. Your account will be set up specifically for that experience." benefits={['Identity verified before account access', 'Clear role-specific onboarding', 'Secure marketplace permissions']}>
        <div className="mb-8">
          <p className="text-sm font-semibold text-primary">Create a new account</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">How would you like to use FIVESOM?</h1>
          <p className="mt-3 text-muted-foreground">Choose one path to continue. Existing members can sign in below.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {choices.map((choice, index) => {
            const Icon = choice.icon;
            const active = selected === choice.role;
            return (
              <button
                key={choice.role}
                type="button"
                onClick={() => choose(choice.role)}
                aria-pressed={active}
                style={{ animationDelay: `${index * 90}ms` }}
                className={`group animate-fade-in-up rounded-lg border bg-card p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] ${active ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105"><Icon className="h-6 w-6" /></span>
                  {active && <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-4 w-4" /></span>}
                </div>
                <p className="mt-6 text-xs font-semibold text-primary">{choice.eyebrow}</p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-card-foreground">{choice.title}</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-foreground">{choice.statement}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{choice.description}</p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">{choice.points.map((point) => <li key={point} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{point}</li>)}</ul>
                <span className="mt-6 flex items-center font-semibold text-primary">Continue as {choice.title}<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </button>
            );
          })}
        </div>

        <p className="mt-7 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in to FIVESOM</Link></p>
      </AuthShell>
    </>
  );
};

export default Register;