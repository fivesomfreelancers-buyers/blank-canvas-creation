import { Crown, Gem, type LucideIcon } from 'lucide-react';

export type VipTier = 'golden' | 'platinum' | null;
export type ThemeMode = 'light' | 'dark';

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
  /** Use as `style={{ backgroundImage: textGradient }}` with `bg-clip-text text-transparent` */
  textGradient: string;
  /** Fallback solid color for body/secondary text inside VIP frames (readable on cardBg) */
  bodyText: string;
  /** Muted text color readable on cardBg */
  mutedText: string;
  Icon: LucideIcon;
}

interface Variant {
  cardBg: string;
  cardShadow: string;
  pageGlow: string;
  textGradient: string;
  bodyText: string;
  mutedText: string;
}

const GOLDEN_BASE = {
  tier: 'golden' as const,
  label: 'GOLDEN VIP SELLER',
  shortLabel: 'GOLD',
  accent: '#B8860B', // darker gold reads well in both modes when used for accents
  accentSoft: 'rgba(255,209,102,0.18)',
  gradient: 'linear-gradient(135deg,#FFD700,#B8860B,#FFD166)',
  ring: '0 0 0 2px #FFD166, 0 0 24px rgba(255,209,102,0.55)',
  Icon: Crown,
};

const PLATINUM_BASE = {
  tier: 'platinum' as const,
  label: 'PLATINUM VIP SELLER',
  shortLabel: 'PLATINUM',
  accent: '#6D5BD0',
  accentSoft: 'rgba(167,139,250,0.18)',
  gradient: 'linear-gradient(135deg,#E0E0FF,#A78BFA,#8A7FFF)',
  ring: '0 0 0 2px #A78BFA, 0 0 24px rgba(167,139,250,0.6)',
  Icon: Gem,
};

const VARIANTS: Record<'golden' | 'platinum', Record<ThemeMode, Variant>> = {
  golden: {
    dark: {
      cardBg: 'radial-gradient(600px 200px at 20% 0%, rgba(255,209,102,0.12), transparent 60%), linear-gradient(180deg, rgba(26,19,3,0.6), rgba(10,7,0,0.7))',
      cardShadow: 'inset 0 0 0 1.5px #FFD166, 0 0 30px rgba(255,209,102,0.18)',
      pageGlow: 'radial-gradient(900px 400px at 50% 0%, rgba(255,209,102,0.08), transparent 70%)',
      textGradient: 'linear-gradient(90deg,#FFD166,#FFEFC2)',
      bodyText: '#F5EBD0',
      mutedText: '#C9B98A',
    },
    light: {
      cardBg: 'radial-gradient(600px 200px at 20% 0%, rgba(255,209,102,0.35), transparent 60%), linear-gradient(180deg, #FFF8E6, #FFEFC2)',
      cardShadow: 'inset 0 0 0 1.5px #B8860B, 0 8px 28px rgba(184,134,11,0.18)',
      pageGlow: 'radial-gradient(900px 400px at 50% 0%, rgba(255,209,102,0.22), transparent 70%)',
      textGradient: 'linear-gradient(90deg,#7A5A00,#B8860B)',
      bodyText: '#3D2C00',
      mutedText: '#7A5A1F',
    },
  },
  platinum: {
    dark: {
      cardBg: 'radial-gradient(600px 200px at 20% 0%, rgba(167,139,250,0.14), transparent 60%), linear-gradient(180deg, rgba(13,18,40,0.6), rgba(6,8,24,0.75))',
      cardShadow: 'inset 0 0 0 1.5px #A78BFA, 0 0 32px rgba(167,139,250,0.22)',
      pageGlow: 'radial-gradient(900px 400px at 50% 0%, rgba(167,139,250,0.1), transparent 70%)',
      textGradient: 'linear-gradient(90deg,#E0E0FF,#A78BFA)',
      bodyText: '#E8E6FF',
      mutedText: '#B8B0E0',
    },
    light: {
      cardBg: 'radial-gradient(600px 200px at 20% 0%, rgba(167,139,250,0.32), transparent 60%), linear-gradient(180deg, #F4F1FF, #E8E0FF)',
      cardShadow: 'inset 0 0 0 1.5px #6D5BD0, 0 8px 28px rgba(109,91,208,0.2)',
      pageGlow: 'radial-gradient(900px 400px at 50% 0%, rgba(167,139,250,0.22), transparent 70%)',
      textGradient: 'linear-gradient(90deg,#3D2A8A,#6D5BD0)',
      bodyText: '#231849',
      mutedText: '#5B4FA0',
    },
  },
};

export function resolveVipTier(vip_tier: any, vip_expires_at: any): VipTier {
  if (!vip_tier) return null;
  if (vip_expires_at && new Date(vip_expires_at) < new Date()) return null;
  return vip_tier === 'platinum' ? 'platinum' : 'golden';
}

export function getVipTheme(tier: VipTier, mode: ThemeMode = 'dark'): VipTheme | null {
  if (!tier) return null;
  const base = tier === 'platinum' ? PLATINUM_BASE : GOLDEN_BASE;
  const v = VARIANTS[tier][mode];
  return { ...base, ...v };
}

/** Back-compat export — defaults to dark variant */
export const VIP_THEMES: Record<'golden' | 'platinum', VipTheme> = {
  golden: getVipTheme('golden', 'dark')!,
  platinum: getVipTheme('platinum', 'dark')!,
};
