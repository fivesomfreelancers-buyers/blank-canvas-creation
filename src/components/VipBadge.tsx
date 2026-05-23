import React from 'react';
import { getVipTheme, resolveVipTier, type VipTier } from '@/lib/vipTheme';

interface Props {
  /** Pass either a resolved tier, or raw db fields */
  tier?: VipTier;
  vip_tier?: any;
  vip_expires_at?: any;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

/**
 * Public VIP badge — shows GOLD / PLATINUM VIP everywhere
 * for any user who has an active VIP membership.
 */
const VipBadge: React.FC<Props> = ({ tier, vip_tier, vip_expires_at, size = 'sm', showLabel = true, className = '' }) => {
  const resolved: VipTier = tier ?? resolveVipTier(vip_tier, vip_expires_at);
  const theme = getVipTheme(resolved);
  if (!theme) return null;

  const sizing =
    size === 'xs' ? 'px-1.5 py-0.5 text-[9px] gap-0.5' :
    size === 'md' ? 'px-2.5 py-1 text-xs gap-1.5' :
    'px-2 py-0.5 text-[10px] gap-1';
  const icon = size === 'md' ? 'w-3.5 h-3.5' : size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <span
      title={theme.label}
      className={`inline-flex items-center font-bold rounded-full tracking-wide ${sizing} ${className}`}
      style={{ background: theme.gradient, color: '#0B0E14', boxShadow: `0 0 10px ${theme.accent}66` }}
    >
      <theme.Icon className={icon} />
      {showLabel && <span>{theme.shortLabel} VIP</span>}
    </span>
  );
};

export default VipBadge;
