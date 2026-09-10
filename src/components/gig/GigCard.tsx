import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import VerifiedBadge from '@/components/VerifiedBadge';
import BlueTickBadge from '@/components/BlueTickBadge';
import VipBadge from '@/components/VipBadge';
import { gigPath } from '@/lib/urls';
import type { SearchGigResult } from '@/hooks/useGigSearch';

/** Compact gig card used by Explore and the category landing pages. */
const GigCard: React.FC<{ gig: SearchGigResult }> = ({ gig }) => (
  <Link
    to={gigPath(gig)}
    className="group backdrop-blur-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl bg-card border border-border"
  >
    <div className="relative overflow-hidden">
      {gig.image ? (
        <img
          src={gig.image}
          alt={gig.title}
          loading="lazy"
          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-32 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-xs">No image</span>
        </div>
      )}
      <div className="absolute top-1.5 left-1.5">
        <VipBadge vip_tier={gig.vipTierRaw} vip_expires_at={gig.vipExpiresAt} size="xs" />
      </div>
    </div>

    <div className="p-2.5">
      <h3 className="font-semibold mb-1.5 line-clamp-2 text-xs leading-snug text-foreground group-hover:text-primary transition-colors min-h-[2rem]">
        {gig.title}
      </h3>

      <div className="flex items-start gap-1.5 mb-2">
        <Avatar className="w-5 h-5 shrink-0">
          <AvatarImage src={gig.freelancerAvatar} alt={gig.freelancer} className="object-cover" />
          <AvatarFallback className="text-[8px] bg-primary text-primary-foreground">
            {gig.freelancer.split(' ').map((n: string) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex flex-col">
          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5 truncate">
            {gig.freelancer}
            {gig.hasBlueTick && <BlueTickBadge size="sm" />}
          </span>
          {gig.isVerified && !gig.hasBlueTick && <VerifiedBadge size="sm" />}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-[10px] font-medium text-foreground">
            {gig.rating > 0 ? gig.rating.toFixed(1) : 'New'}
          </span>
          <span className="text-[10px] text-muted-foreground">({gig.reviews})</span>
        </div>
        <div className="text-xs font-bold text-primary">${gig.price}</div>
      </div>
    </div>
  </Link>
);

export default GigCard;
