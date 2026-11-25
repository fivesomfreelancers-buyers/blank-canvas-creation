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
      <div className="w-full">
        <div className="rank-panel rank-panel-bleed grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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

          <div
            className="rank-columns"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            data-paused={paused || undefined}
          >
            {[0, 1].map((col) => {
              const items = top.map((f, i) => ({ f, i })).filter(({ i }) => i % 2 === col);
              return (
                <div key={col} className="rank-col" aria-hidden={col === 1 ? undefined : undefined}>
                  <ul className={`rank-track ${col === 0 ? 'rank-track-down' : 'rank-track-up'}`}>
                    {[...items, ...items].map(({ f, i }, k) => {
                      const award = AWARDS[i];
                      const dup = k >= items.length;
                      return (
                        <li key={`${f.id}-${k}`} aria-hidden={dup || undefined}>
                          <Link
                            to={f.username ? `/freelancer/${f.username}` : `/profile/${f.id}`}
                            tabIndex={dup ? -1 : 0}
                            className={`rank-card rank-pill-${i + 1}`}
                            aria-label={`Rank ${i + 1}: ${f.name}, score ${f.score}`}
                          >
                            <span className="flex items-start justify-between gap-2">
                              <span className="min-w-0">
                                <span className="block text-xl font-semibold leading-tight line-clamp-2">{f.name}</span>
                                <span className="block text-xs opacity-85 truncate mt-1">{f.skill}</span>
                              </span>
                              <span className="flex flex-col items-center shrink-0">
                                {award && (
                                  <span className={`rank-medal ${award.cls}`} title={award.label}>
                                    <award.Icon className="h-4 w-4" aria-hidden />
                                  </span>
                                )}
                                <span className="text-lg font-black">#{i + 1}</span>
                              </span>
                            </span>
                            <span className={`rank-card-photo ${award?.cls ?? ''}`}>
                              {f.avatar ? (
                                <img src={f.avatar} alt="" loading="lazy" className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-4xl font-bold">{f.name.charAt(0).toUpperCase()}</span>
                              )}
                            </span>
                            <span className="block text-2xl font-bold">{f.score.toFixed(0)} <span className="text-sm font-medium opacity-80">Score</span></span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedFreelancers;
