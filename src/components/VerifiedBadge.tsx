import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
  showLabel?: boolean;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ className, showLabel = false }) => {
  return (
    <span
      title="Verified Freelancer"
      className={cn('inline-flex items-center gap-1 text-primary', className)}
    >
      <BadgeCheck className="w-4 h-4 fill-primary text-primary-foreground" />
      {showLabel && <span className="text-xs font-semibold">Verified</span>}
    </span>
  );
};

export default VerifiedBadge;
