import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useSomAds, SomAdPlacement, SomAd } from '@/hooks/useSomAd';
import { cn } from '@/lib/utils';

interface Props {
  placement: SomAdPlacement;
  viewerRole?: 'buyer' | 'freelancer' | null;
  className?: string;
  children?: React.ReactNode; // fallback content when no active ad
}

const positionClass: Record<string, string> = {
  'top-left': 'top-3 left-3',
  'top-right': 'top-3 right-12',
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

/** Minimum seconds an ad must be visible before it can be closed. */
const MIN_VISIBLE_SECONDS = 30;
/** Rotation interval between multiple ads in the same placement. */
const ROTATE_MS = 30_000;

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
  const { ads, loading } = useSomAds(placement, viewerRole);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(MIN_VISIBLE_SECONDS);
  const [closed, setClosed] = useState(false);
  const startedRef = useRef<number | null>(null);

  // Countdown until the ad can be dismissed (starts once an ad is visible).
  useEffect(() => {
    if (loading || ads.length === 0 || closed) return;
    if (startedRef.current === null) startedRef.current = Date.now();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - (startedRef.current || Date.now())) / 1000);
      setRemaining(Math.max(0, MIN_VISIBLE_SECONDS - elapsed));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [loading, ads.length, closed]);

  // Rotate between multiple ads every 30s.
  useEffect(() => {
    if (ads.length < 2 || closed) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [ads.length, closed]);

  useEffect(() => {
    if (index >= ads.length) setIndex(0);
  }, [ads.length, index]);

  if (loading || ads.length === 0 || closed) return <>{children ?? null}</>;

  const ad = ads[Math.min(index, ads.length - 1)];
  const canClose = remaining === 0;

  return (
    <div className={cn('relative w-full', className)} style={{ aspectRatio: PLACEMENT_ASPECT[placement] }}>
      <SomAdCreative key={ad.id} ad={ad} />

      {/* Close / countdown control */}
      <button
        type="button"
        aria-label={canClose ? 'Close ad' : `Ad can be closed in ${remaining} seconds`}
        disabled={!canClose}
        onClick={() => setClosed(true)}
        className={cn(
          'absolute top-2 right-2 z-20 rounded-full bg-black/65 text-white backdrop-blur-sm transition-colors',
          canClose ? 'h-7 w-7 flex items-center justify-center hover:bg-black/85' : 'px-2 h-7 flex items-center text-[10px] font-semibold cursor-default',
        )}
      >
        {canClose ? <X className="h-4 w-4" /> : `${remaining}s`}
      </button>

      {/* Rotation dots */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {ads.map((a, i) => (
            <button
              key={a.id}
              aria-label={`Show ad ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
