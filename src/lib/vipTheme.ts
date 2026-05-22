import { Crown, Gem, type LucideIcon } from 'lucide-react';

export type VipTier = 'golden' | 'platinum' | null;

export interface VipTheme {
  tier: 'golden' | 'platinum';
  label: string;
  shortLabel: string;
  accent: string;
  accentSoft: string;
  gradient: string;
  ring: string;
  /** Card background gradient — pairs with `boxShadow: cardShadow` */
  cardBg: string;
  cardShadow: string;
  /** Subtle outer page glow */
  pageGlow: string;
  textGradient: string;
  Icon: LucideIcon;
}

export const VIP_THEMES: Record<'golden' | 'platinum', VipTheme> = {
  golden: {
    tier: 'golden',
    label: 'GOLDEN VIP SELLER',
    shortLabel: 'GOLD',
    accent: '#FFD166',
    accentSoft: 'rgba(255,209,102,0.15)',
    gradient: 'linear-gradient(135deg,#FFD700,#B8860B,#FFD166)',
    ring: '0 0 0 2px #FFD166, 0 0 24px rgba(255,209,102,0.5)',
    cardBg: 'radial-gradient(600px 200px at 20% 0%, rgba(255,209,102,0.12), transparent 60%), linear-gradient(180deg, rgba(26,19,3,0.6), rgba(10,7,0,0.7))',
    cardShadow: 'inset 0 0 0 1.5px #FFD166, 0 0 30px rgba(255,209,102,0.18)',
    pageGlow: 'radial-gradient(900px 400px at 50% 0%, rgba(255,209,102,0.08), transparent 70%)',
    textGradient: 'linear-gradient(90deg,#FFD166,#FFEFC2)',
    Icon: Crown,
  },
  platinum: {
    tier: 'platinum',
    label: 'PLATINUM VIP SELLER',
    shortLabel: 'PLATINUM',
    accent: '#A78BFA',
    accentSoft: 'rgba(167,139,250,0.15)',
    gradient: 'linear-gradient(135deg,#E0E0FF,#A78BFA,#8A7FFF)',
    ring: '0 0 0 2px #A78BFA, 0 0 24px rgba(167,139,250,0.55)',
    cardBg: 'radial-gradient(600px 200px at 20% 0%, rgba(167,139,250,0.14), transparent 60%), linear-gradient(180deg, rgba(13,18,40,0.6), rgba(6,8,24,0.75))',
    cardShadow: 'inset 0 0 0 1.5px #A78BFA, 0 0 32px rgba(167,139,250,0.22)',
    pageGlow: 'radial-gradient(900px 400px at 50% 0%, rgba(167,139,250,0.1), transparent 70%)',
    textGradient: 'linear-gradient(90deg,#E0E0FF,#A78BFA)',
    Icon: Gem,
  },
};

export function resolveVipTier(vip_tier: any, vip_expires_at: any): VipTier {
  if (!vip_tier) return null;
  if (vip_expires_at && new Date(vip_expires_at) < new Date()) return null;
  return vip_tier === 'platinum' ? 'platinum' : 'golden';
}

export function getVipTheme(tier: VipTier): VipTheme | null {
  return tier ? VIP_THEMES[tier] : null;
}
