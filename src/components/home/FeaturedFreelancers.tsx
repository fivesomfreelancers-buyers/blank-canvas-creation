import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star, PackageCheck } from 'lucide-react';
import type { SearchGigResult } from '@/hooks/useGigSearch';
import VerifiedBadge from '@/components/VerifiedBadge';
import BlueTickBadge from '@/components/BlueTickBadge';

interface Props {
  gigs: SearchGigResult[];
  loading: boolean;
}

interface FreelancerCard {
  id: string;
  name: string;
  avatar: string;
  username: string | null;
  location: string | null;
  isVerified: boolean;
  hasBlueTick: boolean;
  completedOrders: number;
  rating: number;
  reviews: number;
  services: string[];
}

const dedupe = (gigs: SearchGigResult[]): FreelancerCard[] => {
  const map = new Map<string, FreelancerCard>();
  for (const g of gigs) {
    const existing = map.get(g.freelancerId);
    if (existing) {
      if (existing.services.length < 3) existing.services.push(g.title);
      continue;
    }
    map.set(g.freelancerId, {
      id: g.freelancerId,
      name: g.freelancer,
      avatar: g.freelancerAvatar,
      username: g.freelancerUsername,
      location: g.freelancerLocation,
      isVerified: g.isVerified,
      hasBlueTick: g.hasBlueTick,
      completedOrders: g.completedOrders,
      rating: g.rating,
      reviews: g.reviews,
      services: [g.title],
    });
  }
  return Array.from(map.values())
    .sort(
      (a, b) =>
        Number(b.hasBlueTick) - Number(a.hasBlueTick) ||
        Number(b.isVerified) - Number(a.isVerified) ||
        b.completedOrders - a.completedOrders,
    )
    .slice(0, 6);
};

const FeaturedFreelancers: React.FC<Props> = ({ gigs, loading }) => {
  const freelancers = dedupe(gigs);
  if (loading || freelancers.length === 0) return null;

  return (
    <section aria-labelledby="freelancers-heading" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12">
          <h2 id="freelancers-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Freelancers selling on FIVESOM
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Every profile below belongs to a freelancer with live services on the platform. Open a
            profile to see their skills, portfolio, packages and reviews before you order.
          </p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {freelancers.map((f) => (
            <li key={f.id}>
              <Link
                to={f.username ? `/freelancer/${f.username}` : `/profile/${f.id}`}
                className="group h-full flex flex-col rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  {f.avatar ? (
                    <img
                      src={f.avatar}
                      alt={f.name}
                      loading="lazy"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/15 text-primary font-bold text-lg flex items-center justify-center">
                      {f.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate flex items-center gap-1.5">
                      {f.name}
                      {f.hasBlueTick && <BlueTickBadge size="sm" />}
                    </h3>
                    {f.location && (
                      <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" aria-hidden /> {f.location}
                      </p>
                    )}
                    {f.isVerified && (
                      <span className="block mt-1">
                        <VerifiedBadge size="sm" />
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5 mb-4 flex-1">
                  {f.services.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground line-clamp-1">
                      • {s}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-3">
                    {f.reviews > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-primary text-primary" aria-hidden />
                        <span className="font-semibold text-foreground">{f.rating.toFixed(1)}</span> ({f.reviews})
                      </span>
                    )}
                    {f.completedOrders > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <PackageCheck className="w-3.5 h-3.5" aria-hidden /> {f.completedOrders} completed
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-primary inline-flex items-center gap-1">
                    View profile
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FeaturedFreelancers;
