import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

/**
 * Blue Tick — exclusive verified badge granted only by Fivesom admins.
 * Distinct from the green VerifiedBadge (identity doc verified).
 */
const BlueTickBadge: React.FC<Props> = ({ className, showLabel = false, size = 'md' }) => (
  <span title="Blue Tick — Verified by Fivesom" className={cn('inline-flex items-center gap-1 align-middle', className)}>
    <CheckCircle2 className={cn(sizeMap[size], 'text-white')} style={{ fill: '#1d9bf0' }} />
    {showLabel && <span className="text-xs font-semibold text-[#1d9bf0]">Blue Verified</span>}
  </span>
);

export default BlueTickBadge;
