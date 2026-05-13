import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

/**
 * Twitter-style verified blue checkmark.
 * White check inside a solid blue badge — visually unambiguous.
 */
const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ className, showLabel = false, size = 'md' }) => {
  return (
    <span
      title="Verified by Fivesom"
      className={cn('inline-flex items-center gap-1 align-middle', className)}
    >
      <BadgeCheck
        className={cn(sizeMap[size], 'text-white')}
        style={{ fill: '#1d9bf0' }}
      />
      {showLabel && <span className="text-xs font-semibold text-[#1d9bf0]">Verified</span>}
    </span>
  );
};

export default VerifiedBadge;
