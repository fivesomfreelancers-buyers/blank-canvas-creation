import { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import DocsHome from './DocsHome';
import DocsChapterPage from './DocsChapterPage';
import NotFound from '@/pages/NotFound';
import { DOCS_LANG_STORAGE_KEY } from '@/components/docs/DocsLanguageSwitcher';
import { docsChapterMeta, docsPath, isDocsLang, type DocsLang } from '@/content/docs';

/** Old `/docs#anchor` links map to the chapter that now owns the content. */
const LEGACY_HASH_MAP: Record<string, string> = {
  introduction: 'getting-started',
  'how-it-works': 'getting-started',
  account: 'creating-account',
  security: 'account-security',
  profile: 'freelancer-profile',
  gig: 'creating-gig',
  gigs: 'creating-gig',
  pricing: 'packages-pricing',
  packages: 'packages-pricing',
  earnings: 'earnings-fees',
  fees: 'earnings-fees',
  withdraw: 'withdrawals',
  payouts: 'withdrawals',
  search: 'finding-freelancers',
  ordering: 'buying-gig',
  order: 'buying-gig',
  requirements: 'order-requirements',
  delivery: 'reviewing-delivery',
  messaging: 'messaging-communication',
  deliver: 'delivering-order',
  orders: 'delivering-order',
  revisions: 'revisions',
  dispute: 'disputes',
  disputes: 'disputes',
  escrow: 'escrow-payments',
  payment: 'escrow-payments',
  payments: 'escrow-payments',
  privacy: 'privacy-trust',
  trust: 'privacy-trust',
  verification: 'verification',
  verify: 'verification',
  'blue-tick': 'blue-tick',
  tick: 'blue-tick',
  vip: 'vip-membership',
  levels: 'vip-membership',
  reviews: 'reviewing-delivery',
  community: 'support',
  support: 'support',
  faq: 'support',
};

/**
 * Routes `/docs`, `/docs/:slug`, `/docs/:lang` and `/docs/:lang/:slug` onto the
 * documentation overview or a single chapter page.
 */
const DocsRoute = () => {
  const { a, b } = useParams<{ a?: string; b?: string }>();
  const { hash } = useLocation();

  const lang: DocsLang = isDocsLang(a) ? a : 'en';
  const slug = isDocsLang(a) ? b : a;

  useEffect(() => {
    try {
      localStorage.setItem(DOCS_LANG_STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  // Legacy single-page anchors keep working.
  if (!slug && hash) {
    const target = LEGACY_HASH_MAP[hash.replace('#', '')];
    if (target) return <Navigate to={docsPath(lang, target)} replace />;
  }

  if (!slug) return <DocsHome lang={lang} />;
  if (!docsChapterMeta(slug)) {
    const target = LEGACY_HASH_MAP[slug];
    if (target) return <Navigate to={docsPath(lang, target)} replace />;
    return <NotFound />;
  }

  return <DocsChapterPage lang={lang} slug={slug} />;
};

export default DocsRoute;
