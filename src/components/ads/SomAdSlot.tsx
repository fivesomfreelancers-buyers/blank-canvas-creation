import React from 'react';
import { useSomAd, SomAdPlacement, SomAd } from '@/hooks/useSomAd';
import { cn } from '@/lib/utils';

interface Props {
  placement: SomAdPlacement;
  viewerRole?: 'buyer' | 'freelancer' | null;
  className?: string;
  children?: React.ReactNode; // fallback content when no active ad
}

const positionClass: Record<string, string> = {
  'top-left': 'top-3 left-3',
  'top-right': 'top-3 right-3',
  'top-center': 'top-3 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-3 left-3',
  'bottom-right': 'bottom-3 right-3',
  'bottom-center': 'bottom-3 left-1/2 -translate-x-1/2',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

const sizeClass: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

export function SomAdCreative({ ad, className }: { ad: SomAd; className?: string }) {
  const handleClick = () => {
    if (ad.cta_url) window.open(ad.cta_url, '_blank', 'noopener,noreferrer');
  };

  const btnStyle: React.CSSProperties =
    ad.cta_style === 'outline'
      ? { border: `2px solid ${ad.cta_color}`, color: ad.cta_color, background: 'transparent' }
      : ad.cta_style === 'ghost'
      ? { color: ad.cta_color, background: 'transparent' }
      : { background: ad.cta_color, color: '#fff' };

  return (
    <div className={cn('relative w-full h-full overflow-hidden rounded-lg', className)}>
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleClick}
        style={{ overflow: 'hidden' }}
      >
        {ad.media_type === 'image' ? (
          <img
            src={ad.media_url}
            alt={ad.title}
            className="w-full h-full"
            style={{
              objectFit: 'cover',
              objectPosition: `${ad.focal_x}% ${ad.focal_y}%`,
              transform: `scale(${ad.zoom})`,
              transformOrigin: `${ad.focal_x}% ${ad.focal_y}%`,
            }}
          />
        ) : (
          <video
            src={ad.media_url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full"
            style={{
              objectFit: 'cover',
              objectPosition: `${ad.focal_x}% ${ad.focal_y}%`,
              transform: `scale(${ad.zoom})`,
              transformOrigin: `${ad.focal_x}% ${ad.focal_y}%`,
            }}
          />
        )}
      </div>

      {ad.cta_text && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={cn(
            'absolute font-semibold rounded-md shadow-lg transition-transform hover:scale-105 z-10',
            positionClass[ad.cta_position] || positionClass['bottom-right'],
            sizeClass[ad.cta_size] || sizeClass.md,
          )}
          style={btnStyle}
        >
          {ad.cta_text}
        </button>
      )}

      <span className="absolute top-2 left-2 z-10 text-[9px] font-bold uppercase tracking-wider bg-black/60 text-white px-1.5 py-0.5 rounded">
        Ad
      </span>
    </div>
  );
}

const PLACEMENT_ASPECT: Record<SomAdPlacement, string> = {
  dashboard_banner: '1200 / 160',
  gig_price: '600 / 120',
};

export default function SomAdSlot({ placement, viewerRole, className, children }: Props) {
  const { ad, loading } = useSomAd(placement, viewerRole);

  if (loading || !ad) return <>{children ?? null}</>;

  return (
    <div className={cn('relative w-full', className)} style={{ aspectRatio: PLACEMENT_ASPECT[placement] }}>
      <SomAdCreative ad={ad} />
    </div>
  );
}
