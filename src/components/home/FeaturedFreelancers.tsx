import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Medal, Award, Gem, BadgeCheck } from 'lucide-react';
import type { SearchGigResult } from '@/hooks/useGigSearch';
import { supabase } from '@/integrations/supabase/client';
import ScrollReveal from './ScrollReveal';

interface Props { gigs: SearchGigResult[]; loading: boolean }

const VISIBLE = 5;
const SLOT_SCALE = [1, 0.93, 0.86, 0.8, 0.74];
const SLOT_GAP = 112;

const AWARDS = [
  { label: 'Champion', Icon: Crown, cls: 'rank-award-gold' },
  { label: 'Silver', Icon: Medal, cls: 'rank-award-silver' },
  { label: 'Bronze', Icon: Medal, cls: 'rank-award-bronze' },
  { label: 'Platinum', Icon: Gem, cls: 'rank-award-platinum' },
  { label: 'Excellence', Icon: Award, cls: 'rank-award-blue' },
];

const FeaturedFreelancers: React.FC<Props> = ({ gigs, loading }) => {
  const [top, setTop] = React.useState<{ id: string; name: string; avatar: string; username: string | null; skill: string; score: number }[]>([]);
  const [offset, setOffset] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  React.useEffect(() => {
    (supabase.rpc as any)('get_top_ranked_freelancers', { _limit: 10 }).then(({ data }: any) => {
      setTop((data ?? []).map((r: any) => ({ id: r.freelancer_id, name: r.full_name || 'Freelancer', avatar: r.avatar ?? '', username: r.username, skill: r.skill, score: Number(r.ranking_score) })));
    });
  }, []);
  React.useEffect(() => {
    if (paused || top.length <= VISIBLE) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setOffset((o) => (o + 1) % top.length), 2000);
    return () => clearInterval(t);
  }, [paused, top.length]);
  if (top.length === 0) return null;

  return (
    <section aria-labelledby="freelancers-heading" className="home-story-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rank-panel grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <ScrollReveal from="left" className="lg:sticky lg:top-28 self-start">
            <span className="rank-kicker">Freelancers selling on FIVESOM</span>
            <h2 id="freelancers-heading" className="rank-title">Meet the Talent. See the Results.</h2>
            <p className="rank-copy">
              Discover FIVESOM's highest-performing freelancers. Ranked by their performance, quality,
              completed projects, and client satisfaction. Find the right professional and turn your
              next idea into reality.
            </p>
            <Link to="/explore" className="rank-cta">
              Explore Top Freelancers <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <p className="rank-trust"><BadgeCheck className="h-4 w-4" aria-hidden /> Top talent. Proven performance. Trusted results.</p>
          </ScrollReveal>

          <ol
            className="rank-stage relative w-full"
            style={{ height: `${Math.min(VISIBLE, top.length) * SLOT_GAP}px` }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            {top.map((f, i) => {
              const award = AWARDS[i];
              const n = top.length;
              const slot = (i - offset + n) % n;
              const visible = slot < VISIBLE;
              const y = visible ? slot * SLOT_GAP : slot === n - 1 ? -SLOT_GAP : VISIBLE * SLOT_GAP;
              const scale = visible ? SLOT_SCALE[slot] : 0.7;
              return (
                <li
                  key={f.id}
                  className="rank-slot"
                  aria-hidden={!visible}
                  style={{
                    transform: `translate(-50%, ${y}px) scale(${scale})`,
                    opacity: visible ? 1 : 0,
                    zIndex: VISIBLE - Math.min(slot, VISIBLE),
                    pointerEvents: visible ? 'auto' : 'none',
                  }}
                >
                  <Link
                    to={f.username ? `/freelancer/${f.username}` : `/profile/${f.id}`}
                    tabIndex={visible ? 0 : -1}
                    className={`rank-pill rank-pill-${i + 1} ${award ? 'rank-pill-top' : ''}`}
                    aria-label={`Rank ${i + 1}: ${f.name}, score ${f.score}`}
                  >
                    <span className={`rank-avatar ${award?.cls ?? ''}`}>
                      {f.avatar ? (
                        <img src={f.avatar} alt="" loading="lazy" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold">{f.name.charAt(0).toUpperCase()}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold truncate">{f.name}</span>
                      <span className="block text-2xl font-bold leading-tight">{f.score.toFixed(0)} <span className="text-sm font-medium opacity-80">Score</span></span>
                      <span className="block text-xs opacity-85 truncate">{f.skill}</span>
                    </span>
                    <span className="flex flex-col items-center shrink-0">
                      {award && (
                        <span className={`rank-medal ${award.cls}`} title={award.label}>
                          <award.Icon className="h-4 w-4" aria-hidden />
                        </span>
                      )}
                      <span className="text-lg font-black">#{i + 1}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default FeaturedFreelancers;
