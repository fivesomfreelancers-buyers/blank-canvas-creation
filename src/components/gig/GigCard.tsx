import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import VerifiedBadge from '@/components/VerifiedBadge';
import BlueTickBadge from '@/components/BlueTickBadge';
import VipBadge from '@/components/VipBadge';
import { gigPath } from '@/lib/urls';
import { gigImageAlt } from '@/lib/seo/gigImages';
import type { SearchGigResult } from '@/hooks/useGigSearch';

/** Compact gig card used by Explore and the category landing pages. */
const GigCard: React.FC<{ gig: SearchGigResult }> = ({ gig }) => (
  <Link
    to={gigPath(gig)}
    className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
  >
    <div className="relative overflow-hidden">
      {gig.image ? (
        <img
          src={gig.image}
          alt={gigImageAlt(gig.title, 0, gig.freelancer)}
          title={gig.title}
          width={480}
          height={300}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-xs">No image</span>
        </div>
      )}
      <div className="absolute top-1.5 left-1.5">
        <VipBadge vip_tier={gig.vipTierRaw} vip_expires_at={gig.vipExpiresAt} size="xs" />
      </div>
    </div>

    <div className="p-4">
      <h3 className="mb-3 min-h-[2.75rem] line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {gig.title}
      </h3>

      <div className="flex items-start gap-1.5 mb-2">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={gig.freelancerAvatar} alt={gig.freelancer} className="object-cover" />
          <AvatarFallback className="text-[8px] bg-primary text-primary-foreground">
            {gig.freelancer.split(' ').map((n: string) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex flex-col">
          <span className="inline-flex items-center gap-0.5 truncate text-xs text-muted-foreground">
            {gig.freelancer}
            {gig.hasBlueTick && <BlueTickBadge size="sm" />}
          </span>
          {gig.isVerified && !gig.hasBlueTick && <VerifiedBadge size="sm" />}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="text-xs font-medium text-foreground">
            {gig.rating > 0 ? gig.rating.toFixed(1) : 'New'}
          </span>
          <span className="text-xs text-muted-foreground">({gig.reviews})</span>
        </div>
        <div className="text-right"><span className="block text-[10px] text-muted-foreground">Starting at</span><span className="text-base font-bold text-foreground">${gig.price}</span></div>
      </div>
    </div>
  </Link>
);

export default GigCard;
