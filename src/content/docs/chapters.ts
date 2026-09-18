import {
  BadgeCheck,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  CreditCard,
  FileCheck2,
  FileText,
  IdCard,
  LifeBuoy,
  LockKeyhole,
  MessageSquare,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
  UploadCloud,
  UserPlus,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import {
  accountMp4,
  buyerAcceptMp4,
  disputeMp4,
  gigMp4,
  messagingMp4,
  orderingMp4,
  ordersMp4,
  withdrawMoneyMp4,
  verifyAccountTutorialMp4,
} from '@/lib/mediaUrls';

/** Languages the documentation is genuinely translated into. */
export const DOCS_LANGS = ['en', 'so', 'ar', 'fr'] as const;
export type DocsLang = (typeof DOCS_LANGS)[number];

export const DOCS_LANG_LABELS: Record<DocsLang, string> = {
  en: 'English',
  so: 'Soomaali',
  ar: 'العربية',
  fr: 'Français',
};

export const isDocsLang = (value?: string): value is DocsLang =>
  !!value && (DOCS_LANGS as readonly string[]).includes(value);

export type DocsGroupId =
  | 'getting-started'
  | 'freelancers'
  | 'buyers'
  | 'orders'
  | 'payments'
  | 'verification'
  | 'support';

export const DOCS_GROUP_ORDER: DocsGroupId[] = [
  'getting-started',
  'freelancers',
  'buyers',
  'orders',
  'payments',
  'verification',
  'support',
];

/** Structure of a chapter. Text lives in the per-language content files. */
export interface DocsChapterMeta {
  /** Slug used in the URL and as the legacy hash anchor id. */
  id: string;
  group: DocsGroupId;
  icon: LucideIcon;
  video?: string;
  cta?: { to: string };
  related: string[];
}

export const DOCS_CHAPTERS: DocsChapterMeta[] = [
  { id: 'getting-started', group: 'getting-started', icon: BookOpen, cta: { to: '/how-it-works' }, related: ['creating-account', 'finding-freelancers', 'freelancer-profile'] },
  { id: 'creating-account', group: 'getting-started', icon: UserPlus, video: accountMp4.url, cta: { to: '/register' }, related: ['account-security', 'freelancer-profile', 'finding-freelancers'] },
  { id: 'account-security', group: 'getting-started', icon: LockKeyhole, cta: { to: '/legal/privacy' }, related: ['privacy-trust', 'support', 'escrow-payments'] },

  { id: 'freelancer-profile', group: 'freelancers', icon: IdCard, cta: { to: '/freelancer/profile' }, related: ['creating-gig', 'verification', 'earnings-fees'] },
  { id: 'creating-gig', group: 'freelancers', icon: BriefcaseBusiness, video: gigMp4.url, cta: { to: '/create-gig' }, related: ['packages-pricing', 'order-requirements', 'delivering-order'] },
  { id: 'packages-pricing', group: 'freelancers', icon: SlidersHorizontal, related: ['creating-gig', 'buying-gig', 'earnings-fees'] },
  { id: 'earnings-fees', group: 'freelancers', icon: Banknote, cta: { to: '/freelancer/wallet' }, related: ['withdrawals', 'delivering-order', 'packages-pricing'] },
  { id: 'withdrawals', group: 'freelancers', icon: Wallet, video: withdrawMoneyMp4.url, cta: { to: '/freelancer/wallet' }, related: ['earnings-fees', 'escrow-payments', 'support'] },

  { id: 'finding-freelancers', group: 'buyers', icon: Search, cta: { to: '/explore' }, related: ['buying-gig', 'messaging-communication', 'reviewing-delivery'] },
  { id: 'buying-gig', group: 'buyers', icon: CreditCard, video: orderingMp4.url, cta: { to: '/explore' }, related: ['order-requirements', 'escrow-payments', 'reviewing-delivery'] },
  { id: 'order-requirements', group: 'buyers', icon: FileText, cta: { to: '/buyer/orders' }, related: ['buying-gig', 'messaging-communication', 'revisions'] },
  { id: 'reviewing-delivery', group: 'buyers', icon: PackageCheck, video: buyerAcceptMp4.url, cta: { to: '/buyer/orders' }, related: ['revisions', 'disputes', 'escrow-payments'] },

  { id: 'messaging-communication', group: 'orders', icon: MessageSquare, video: messagingMp4.url, cta: { to: '/inbox' }, related: ['order-requirements', 'delivering-order', 'disputes'] },
  { id: 'delivering-order', group: 'orders', icon: UploadCloud, video: ordersMp4.url, cta: { to: '/freelancer/orders' }, related: ['reviewing-delivery', 'revisions', 'earnings-fees'] },
  { id: 'revisions', group: 'orders', icon: RotateCcw, related: ['reviewing-delivery', 'messaging-communication', 'disputes'] },
  { id: 'disputes', group: 'orders', icon: FileCheck2, video: disputeMp4.url, related: ['escrow-payments', 'revisions', 'support'] },

  { id: 'escrow-payments', group: 'payments', icon: ShieldCheck, related: ['buying-gig', 'reviewing-delivery', 'withdrawals'] },
  { id: 'privacy-trust', group: 'payments', icon: ShieldCheck, cta: { to: '/legal/terms' }, related: ['account-security', 'disputes', 'support'] },

  { id: 'verification', group: 'verification', icon: BadgeCheck, video: verifyAccountTutorialMp4.url, cta: { to: '/freelancer/verify' }, related: ['blue-tick', 'freelancer-profile', 'privacy-trust'] },
  { id: 'blue-tick', group: 'verification', icon: BadgeCheck, cta: { to: '/freelancer/verify' }, related: ['verification', 'vip-membership', 'freelancer-profile'] },
  { id: 'vip-membership', group: 'verification', icon: Trophy, cta: { to: '/vip' }, related: ['blue-tick', 'creating-gig', 'earnings-fees'] },

  { id: 'support', group: 'support', icon: LifeBuoy, cta: { to: '/buyer/help' }, related: ['account-security', 'disputes', 'privacy-trust'] },
];

export const docsChapterMeta = (id: string) => DOCS_CHAPTERS.find((c) => c.id === id);

export const docsPath = (lang: DocsLang, slug?: string): string => {
  const base = lang === 'en' ? '/docs' : `/docs/${lang}`;
  return slug ? `${base}/${slug}` : base;
};
