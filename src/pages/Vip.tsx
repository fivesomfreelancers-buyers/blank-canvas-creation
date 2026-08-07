import React from 'react';
import { Crown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';

const Vip: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="FIVESOM VIP — Coming Soon"
        description="FIVESOM VIP Membership is coming soon. Get ready for premium ranking, featured placement, priority support and exclusive badges."
        canonical="/vip"
      />
      <Navbar />

      <section className="relative overflow-hidden flex items-center justify-center min-h-[70vh] px-4 sm:px-6 lg:px-8 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(closest-side, rgba(255,209,102,0.55), transparent)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-1/4 left-1/2 -translate-x-1/2 h-[24rem] w-[24rem] rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(closest-side, rgba(167,139,250,0.55), transparent)' }}
        />

        <div className="relative max-w-2xl mx-auto">
          <div
            className="mx-auto mb-6 h-20 w-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FFD166, #A78BFA)', boxShadow: '0 0 32px rgba(255,209,102,0.35)' }}
          >
            <Crown className="h-10 w-10 text-[#0B0E14]" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg,#FFD166,#ffffff,#A78BFA)' }}>
            VIP Membership
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Premium membership tiers are on the way. Stay tuned for Golden & Platinum perks including verified badges, featured placement, and priority support.
          </p>

          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm mb-10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,209,102,0.15), rgba(167,139,250,0.15))',
              boxShadow: 'inset 0 0 0 1px rgba(255,209,102,0.4)',
              color: '#FFD166',
            }}
          >
            <Clock className="h-4 w-4" />
            Coming Soon
          </div>

          <div>
            <Button onClick={() => navigate('/')} size="lg">
              Back to Home
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Vip;
