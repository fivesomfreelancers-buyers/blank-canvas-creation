import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Crown, Sparkles, BadgeCheck, Trophy, Zap, Star, Headphones,
  TrendingUp, Gift, Lock, ArrowRight, Check, Rocket, Gem, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';

const TIERS = [
  {
    id: 'golden' as const,
    name: 'Golden VIP',
    price: '$2',
    period: '/month',
    duration: '30 days',
    icon: Crown,
    accent: '#FFD166',
    accentDark: '#B8860B',
    tagline: 'Stand out from the crowd',
    perks: [
      'Golden verified tick ✔️',
      'Better ranking in search',
      'Featured gigs placement',
      'Small homepage boost',
      '2 buyer order promotions',
      'Better visibility',
      'Faster support response',
      'Exclusive golden badge',
      'Better trust level',
      'Search boost',
    ],
    gradient: 'linear-gradient(135deg,#FFD700,#B8860B,#FFD166)',
    glow: '0 0 32px rgba(255,209,102,0.45)',
  },
  {
    id: 'platinum' as const,
    name: 'Platinum VIP',
    price: '$10',
    period: '/year',
    duration: '1 year',
    icon: Gem,
    accent: '#C0C0FF',
    accentDark: '#8A7FFF',
    tagline: 'The pinnacle of Fivesom prestige',
    popular: true,
    perks: [
      'Platinum verified tick ✔️',
      'Strong homepage spotlight',
      'Highest ranking priority',
      'Premium featured placement',
      '5 buyer order promotions',
      'Strong search boost',
      'Premium campaign support',
      'Priority support 24/7',
      'Trusted premium seller badge',
      'Platform-wide visibility boost',
      'Dedicated premium appearance',
      'More buyer trust',
      'Higher algorithm ranking',
      'Premium account status',
    ],
    gradient: 'linear-gradient(135deg,#E0E0FF,#A78BFA,#8A7FFF)',
    glow: '0 0 40px rgba(167,139,250,0.55)',
  },
];

const Vip: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const requestVip = async (tier: typeof TIERS[number]) => {
    if (!user) {
      toast.error('Please sign in to purchase VIP membership');
      navigate('/login');
      return;
    }
    setSubmitting(tier.id);
    // Go straight to bank checkout — admin will activate after verification
    navigate('/vip-checkout', { state: { tier: tier.id } });
    setSubmitting(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="FIVESOM VIP — Golden & Platinum Premium Membership"
        description="Upgrade to FIVESOM Golden or Platinum VIP for premium ranking, featured placement, priority support and exclusive badges."
        canonical="/vip"
      />
      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden text-slate-100"
        style={{
          background:
            'radial-gradient(1200px 600px at 10% -10%, rgba(255,209,102,0.16), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(167,139,250,0.18), transparent 60%), #0B0E14',
        }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(255,209,102,0.35), transparent)' }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(167,139,250,0.35), transparent)' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge className="border-0 mb-6 px-3 py-1 text-[11px] tracking-widest uppercase"
            style={{ background: 'rgba(255,209,102,0.12)', boxShadow: 'inset 0 0 0 1px rgba(255,209,102,0.4)', color: '#FFD166' }}>
            <Sparkles className="h-3 w-3 mr-1.5 inline" /> FIVESOM VIP
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold mb-5 bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg,#FFD166,#ffffff,#A78BFA)' }}>
            Premium Membership
          </h1>
          <p className="text-base sm:text-lg text-[#9bb6cc] max-w-2xl mx-auto mb-8">
            Choose between Golden and Platinum — built for the freelancers who want to dominate the platform.
          </p>
          <a href="#tiers">
            <Button size="lg" className="text-white border-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FFD166, #A78BFA)', boxShadow: '0 0 24px rgba(167,139,250,0.45)' }}>
              <Rocket className="h-4 w-4 mr-2" /> Choose Your VIP
            </Button>
          </a>
        </div>
      </section>

      {/* Tiers */}
      <section id="tiers" className="relative py-20 px-4 sm:px-6 lg:px-8 text-slate-100 overflow-hidden"
        style={{ background: 'radial-gradient(900px 500px at 50% -10%, rgba(167,139,250,0.18), transparent 60%), #0B0E14' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg,#FFD166,#ffffff,#A78BFA)' }}>
              Choose Your VIP Tier
            </h2>
            <p className="text-[#9bb6cc] mt-2">Pay first, admin activates within hours of confirmation.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {TIERS.map((t) => (
              <div key={t.id}
                className={`relative rounded-2xl p-7 backdrop-blur-xl flex flex-col ${t.popular ? 'md:-translate-y-3' : ''}`}
                style={{
                  background: 'linear-gradient(180deg, rgba(13,17,26,0.92), rgba(11,14,20,0.97))',
                  boxShadow: `inset 0 0 0 1.5px ${t.accent}, ${t.glow}`,
                }}>
                {t.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-0 px-3 py-1 text-[10px] tracking-widest uppercase"
                    style={{ background: t.gradient, color: '#0B0E14' }}>
                    Most Premium
                  </Badge>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center"
                    style={{ background: t.gradient, boxShadow: t.glow }}>
                    <t.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: t.accent }}>{t.name}</h3>
                    <p className="text-[12px] text-[#7aa7c4] uppercase tracking-wider">{t.tagline}</p>
                  </div>
                </div>
                <div className="mb-1">
                  <span className="text-5xl font-extrabold text-white">{t.price}</span>
                  <span className="text-base text-[#9bb6cc]">{t.period}</span>
                </div>
                <p className="text-xs text-[#7aa7c4] mb-5">Auto-expires after {t.duration} unless renewed</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {t.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-slate-200">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: t.accent }} />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => requestVip(t)}
                  disabled={submitting === t.id}
                  className="w-full text-white border-0 h-12 text-base font-semibold"
                  style={{ background: t.gradient, color: '#0B0E14', boxShadow: t.glow }}>
                  {submitting === t.id ? 'Sending request…' : `Request ${t.name}`}
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 text-sm text-[#7aa7c4] flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" /> Admin approval required. You will be notified once VIP is activated on your account.
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Vip;
