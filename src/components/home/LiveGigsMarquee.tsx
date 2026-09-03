import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, ArrowRight } from 'lucide-react';
import type { SearchGigResult } from '@/hooks/useGigSearch';
import VerifiedBadge from '@/components/VerifiedBadge';

const gigHref = (g: SearchGigResult) => `/gig/${g.slug || g.id}`;

const prettyCategory = (slug: string) =>
  slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Digital Service';

const GigCard: React.FC<{ gig: SearchGigResult }> = ({ gig }) => (
  <Link
    to={gigHref(gig)}
    className="group w-[270px] sm:w-[300px] shrink-0 rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all"
  >
    <div className="aspect-[4/3] bg-muted overflow-hidden">
      {gig.image ? (
        <img
          src={gig.image}
          alt={gig.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
          No preview image
        </div>
      )}
    </div>

    <div className="p-4">
      <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-primary mb-2">
        {prettyCategory(gig.category)}
      </span>

      <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
        {gig.title}
      </h3>

      <div className="flex items-center gap-2 mb-3">
        {gig.freelancerAvatar ? (
          <img
            src={gig.freelancerAvatar}
            alt={gig.freelancer}
            loading="lazy"
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
            {gig.freelancer.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs text-muted-foreground truncate">{gig.freelancer}</span>
        {gig.isVerified && <VerifiedBadge size="sm" showLabel={false} />}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        {gig.reviews > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" aria-hidden />
            <span className="text-foreground font-semibold">{gig.rating.toFixed(1)}</span>
            <span>({gig.reviews})</span>
          </span>
        ) : (
          <span>New service</span>
        )}
        {gig.deliveryDays ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden /> {gig.deliveryDays}d delivery
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm">
          <span className="text-muted-foreground text-xs">From </span>
          <span className="font-bold text-foreground">${gig.price.toFixed(0)}</span>
        </span>
        <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
          View Gig <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden />
        </span>
      </div>
    </div>
  </Link>
);

interface Props {
  gigs: SearchGigResult[];
  loading: boolean;
}

/**
 * Real services published on FIVESOM, scrolling gently right-to-left.
 * The track is duplicated so the loop is seamless; it pauses on hover and
 * respects reduced-motion preferences.
 */
const LiveGigsMarquee: React.FC<Props> = ({ gigs, loading }) => {
  const hasGigs = gigs.length > 0;
  const track = hasGigs ? [...gigs, ...gigs] : [];

  return (
    <section aria-labelledby="live-gigs-heading" className="py-16 border-y border-border bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 id="live-gigs-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              Services available on FIVESOM right now
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              These are real gigs published by freelancers on the platform. Open any gig to see
              its packages, delivery time and what is included, then order with escrow protection.
            </p>
          </div>
          <Link
            to="/explore"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Browse all services <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[270px] sm:w-[300px] shrink-0 rounded-2xl border border-border bg-card">
              <div className="aspect-[4/3] bg-muted animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : !hasGigs ? (
        <div className="max-w-2xl mx-auto px-4 text-center rounded-2xl border border-dashed border-border bg-card/50 py-12">
          <p className="text-foreground font-semibold mb-2">No services published yet</p>
          <p className="text-sm text-muted-foreground mb-5">
            FIVESOM is open for freelancers. Publish the first gig and start receiving orders.
          </p>
          <Link
            to="/register/freelancer"
            className="inline-flex px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Become a Freelancer
          </Link>
        </div>
      ) : (
        <div
          className="group relative overflow-hidden"
          style={{
            maskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
          }}
        >
          <ul className="flex gap-5 w-max animate-marquee-left group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:overflow-x-auto">
            {track.map((gig, i) => (
              <li key={`${gig.id}-${i}`} aria-hidden={i >= gigs.length}>
                <GigCard gig={gig} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default LiveGigsMarquee;
