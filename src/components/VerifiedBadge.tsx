import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

const textMap = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
};

/**
 * "Verified Seller" — green shield label.
 * Granted to freelancers who completed identity verification (after first order).
 * This is NOT the Blue Tick — that's a separate, stricter award.
 */
const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ className, showLabel = true, size = 'sm' }) => {
  return (
    <span
      title="Verified Seller — identity confirmed by Fivesom"
      className={cn(
        'inline-flex items-center gap-1 align-middle font-medium text-emerald-500',
        textMap[size],
        className
      )}
    >
      <ShieldCheck className={cn(sizeMap[size], 'text-emerald-500')} />
      {showLabel && <span>Verified seller</span>}
    </span>
  );
};

export default VerifiedBadge;
