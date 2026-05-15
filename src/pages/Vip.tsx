import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown, Sparkles, Shield, BadgeCheck, Trophy, Zap, Star, Headphones,
  TrendingUp, Gift, Lock, ArrowRight, Check, Rocket, Gem,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';

const PERKS = [
  { icon: BadgeCheck, title: 'Priority Verified Tick', desc: 'Fast-tracked verification with a premium VIP badge.' },
  { icon: TrendingUp, title: 'Boosted Ranking', desc: 'Your gigs appear higher in search and explore results.' },
  { icon: Sparkles, title: 'Featured Placement', desc: 'Rotated on the homepage and category spotlights.' },
  { icon: Headphones, title: '24/7 VIP Support', desc: 'Skip the queue with a dedicated support channel.' },
  { icon: Zap, title: 'Lower Platform Fees', desc: 'Reduced commission on every completed order.' },
  { icon: Shield, title: 'Enhanced Trust Layer', desc: 'Buyers see VIP signals across chat, gigs and profile.' },
  { icon: Gift, title: 'Exclusive Promotions', desc: 'Early access to seasonal campaigns and contests.' },
  { icon: Trophy, title: 'Weekly Winner Eligibility', desc: 'Auto-enrolled into Top Seller weekly rewards.' },
];

const TIERS = [
  {
    name: 'Silver VIP', price: '$9', period: '/mo', icon: Star, accent: '#9bdcff',
    perks: ['Priority verification', 'Boosted ranking (x1.5)', 'VIP badge on profile', 'Priority support'],
  },
  {
    name: 'Gold VIP', price: '$19', period: '/mo', icon: Crown, accent: '#FFD166', popular: true,
    perks: ['Everything in Silver', 'Featured placement', 'Lower platform fees', 'Weekly winner boost'],
  },
  {
    name: 'Platinum VIP', price: '$39', period: '/mo', icon: Gem, accent: '#00CCFF',
    perks: ['Everything in Gold', 'Homepage spotlight', 'Dedicated account manager', 'Custom promo campaigns'],
  },
];

const Vip: React.FC = () => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const requestVip = async (tier: string) => {
    if (!user) {
      toast.error('Please sign in to request VIP membership');
      return;
    }
    setSubmitting(tier);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        subject: `VIP Membership Request — ${tier}`,
        message: `User ${user.email} is requesting ${tier} VIP membership. Please review their account and contact them with next steps.`,
        category: 'vip_request',
        priority: 'high',
        status: 'open',
      } as any);
      if (error) throw error;
      toast.success(`Your ${tier} request was sent to our team. We'll be in touch shortly.`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit request. Try again.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="FIVESOM VIP — Featured Sellers, Boosted Ranking & Lower Fees"
        description="Upgrade to FIVESOM VIP for priority verification, boosted gig ranking, featured placement, lower fees and 24/7 dedicated support."
        canonical="/vip"
      />
      <Navbar />

      {/* VIP Hero — admin-style dark gradient with neon glow */}
      <section
        className="relative overflow-hidden text-slate-100"
        style={{
          background:
            'radial-gradient(1200px 600px at 10% -10%, rgba(0,163,255,0.18), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(0,204,255,0.14), transparent 60%), #0B0E14',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(0,163,255,0.35), transparent)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(255,209,102,0.18), transparent)' }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge
            className="border-0 mb-6 px-3 py-1 text-[11px] tracking-widest uppercase"
            style={{
              background: 'rgba(255,209,102,0.12)',
              boxShadow: 'inset 0 0 0 1px rgba(255,209,102,0.4)',
              color: '#FFD166',
            }}
          >
            <Sparkles className="h-3 w-3 mr-1.5 inline" /> FIVESOM VIP
          </Badge>
          <h1
            className="text-4xl sm:text-6xl font-bold mb-5 bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg,#ffffff,#9bdcff)' }}
          >
            Unlock the VIP Experience
          </h1>
          <p className="text-base sm:text-lg text-[#9bb6cc] max-w-2xl mx-auto mb-8">
            Premium ranking, lower fees, priority support and exclusive features built for the
            top freelancers and serious buyers on FIVESOM.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#tiers">
              <Button
                size="lg"
                className="text-white border-0 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #007BFF, #00CCFF)',
                  boxShadow: '0 0 24px rgba(0,163,255,0.45)',
                }}
              >
                <Rocket className="h-4 w-4 mr-2" /> Choose Your Tier
              </Button>
            </a>
            <Link to="/docs">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-white/5"
              >
                Learn More <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Perks grid */}
      <section
        className="relative py-16 px-4 sm:px-6 lg:px-8 text-slate-100"
        style={{ background: '#0B0E14' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg,#ffffff,#9bdcff)' }}
            >
              VIP Perks
            </h2>
            <p className="text-[#9bb6cc] mt-2">Everything you get the moment you upgrade.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PERKS.map((p) => (
              <div
                key={p.title}
                className="rounded-xl p-5 backdrop-blur-xl transition-transform hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(180deg, rgba(13,17,26,0.85), rgba(11,14,20,0.9))',
                  boxShadow: 'inset 0 0 0 1px rgba(0,163,255,0.18)',
                }}
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #007BFF, #00CCFF)',
                    boxShadow: '0 0 14px rgba(0,163,255,0.5)',
                  }}
                >
                  <p.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">{p.title}</h3>
                <p className="text-sm text-[#9bb6cc] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers / pricing */}
      <section
        id="tiers"
        className="relative py-20 px-4 sm:px-6 lg:px-8 text-slate-100 overflow-hidden"
        style={{
          background:
            'radial-gradient(900px 500px at 50% -10%, rgba(0,163,255,0.18), transparent 60%), #0B0E14',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg,#ffffff,#9bdcff)' }}
            >
              Choose Your VIP Tier
            </h2>
            <p className="text-[#9bb6cc] mt-2">
              Request membership and our team will activate it on your account.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`relative rounded-2xl p-6 backdrop-blur-xl flex flex-col ${
                  t.popular ? 'md:-translate-y-2' : ''
                }`}
                style={{
                  background: 'linear-gradient(180deg, rgba(13,17,26,0.9), rgba(11,14,20,0.95))',
                  boxShadow: t.popular
                    ? `inset 0 0 0 1px ${t.accent}, 0 0 32px rgba(255,209,102,0.25)`
                    : 'inset 0 0 0 1px rgba(0,163,255,0.22)',
                }}
              >
                {t.popular && (
                  <Badge
                    className="absolute -top-3 left-1/2 -translate-x-1/2 border-0 px-3 py-1 text-[10px] tracking-widest uppercase"
                    style={{
                      background: 'linear-gradient(135deg,#FFD166,#FF9F1C)',
                      color: '#0B0E14',
                    }}
                  >
                    Most Popular
                  </Badge>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${t.accent}, #007BFF)`,
                      boxShadow: `0 0 18px ${t.accent}55`,
                    }}
                  >
                    <t.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.name}</h3>
                    <p className="text-[11px] text-[#7aa7c4] uppercase tracking-wider">
                      Premium Membership
                    </p>
                  </div>
                </div>
                <div className="mb-5">
                  <span className="text-4xl font-extrabold text-white">{t.price}</span>
                  <span className="text-sm text-[#9bb6cc]">{t.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {t.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-slate-200">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: t.accent }} />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => requestVip(t.name)}
                  disabled={submitting === t.name}
                  className="w-full text-white border-0"
                  style={{
                    background: t.popular
                      ? 'linear-gradient(135deg,#FFD166,#FF9F1C)'
                      : 'linear-gradient(135deg, #007BFF, #00CCFF)',
                    color: t.popular ? '#0B0E14' : '#fff',
                    boxShadow: t.popular
                      ? '0 0 18px rgba(255,209,102,0.45)'
                      : '0 0 18px rgba(0,163,255,0.45)',
                  }}
                >
                  {submitting === t.name ? 'Sending request…' : `Request ${t.name}`}
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 text-sm text-[#7aa7c4] flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" /> Requests are reviewed by the FIVESOM team. You will be
            notified once your VIP status is activated.
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Vip;
