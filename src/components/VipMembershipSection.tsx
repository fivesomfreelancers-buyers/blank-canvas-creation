import React from 'react';
import { Crown, Gem, Sparkles, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const VipMembershipSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-y border-border bg-muted/30">
      {/* Decorative gradient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/4 h-72 w-72 rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(closest-side, rgba(255,209,102,0.6), transparent)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full blur-3xl opacity-25"
        style={{ background: 'radial-gradient(closest-side, rgba(167,139,250,0.6), transparent)' }}
      />

      <div className="relative max-w-5xl mx-auto text-center">
        <Badge
          className="mb-5 px-3 py-1 text-[11px] tracking-widest uppercase border-0"
          style={{
            background: 'rgba(255,209,102,0.12)',
            boxShadow: 'inset 0 0 0 1px rgba(255,209,102,0.4)',
            color: '#FFD166',
          }}
        >
          <Sparkles className="h-3 w-3 mr-1.5 inline" /> FIVESOM VIP
        </Badge>

        <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(90deg,#FFD166,#ffffff,#A78BFA)' }}>
          VIP Membership
        </h2>

        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Unlock premium visibility, verified badges, priority support, and featured placement.
          Built for freelancers ready to stand out on FIVESOM.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
          <div
            className="rounded-2xl p-6 text-left border"
            style={{
              background: 'linear-gradient(180deg, rgba(255,209,102,0.08), rgba(13,17,26,0.92))',
              borderColor: 'rgba(255,209,102,0.35)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#FFD700,#B8860B)' }}
              >
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#FFD166]">Golden VIP</h3>
                <p className="text-xs text-muted-foreground">Stand out from the crowd</p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Verified golden tick</li>
              <li>• Better search ranking</li>
              <li>• Featured gig placement</li>
              <li>• Faster support response</li>
            </ul>
          </div>

          <div
            className="rounded-2xl p-6 text-left border"
            style={{
              background: 'linear-gradient(180deg, rgba(167,139,250,0.08), rgba(13,17,26,0.92))',
              borderColor: 'rgba(167,139,250,0.35)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#A78BFA,#8A7FFF)' }}
              >
                <Gem className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#C0C0FF]">Platinum VIP</h3>
                <p className="text-xs text-muted-foreground">The pinnacle of prestige</p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Verified platinum tick</li>
              <li>• Highest ranking above Golden</li>
              <li>• Homepage featured priority</li>
              <li>• 24/7 priority support</li>
            </ul>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(255,209,102,0.15), rgba(167,139,250,0.15))',
            boxShadow: 'inset 0 0 0 1px rgba(255,209,102,0.4)',
            color: '#FFD166',
          }}
        >
          <Clock className="h-4 w-4" />
          Coming Soon
        </div>
      </div>
    </section>
  );
};

export default VipMembershipSection;
