import { SITE_URL } from '@/components/SEO';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'FIVESOM',
  alternateName: 'Fivesom Freelance Marketplace',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.png`,
  image: `${SITE_URL}/og-image.png`,
  description:
    'FIVESOM is a global freelance marketplace connecting buyers with verified freelancers, with escrow-protected payments and local mobile-money payouts for African and Somali talent.',
  email: 'fivesomsupport@gmail.com',
  foundingDate: '2025',
  areaServed: ['Worldwide', 'Africa', 'Somalia', 'Horn of Africa'],
  knowsAbout: [
    'freelance marketplace',
    'hiring freelancers',
    'graphic design',
    'web development',
    'video editing',
    'digital marketing',
    'translation',
    'escrow payments',
  ],
  sameAs: [
    'https://www.facebook.com/fivesom',
    'https://www.instagram.com/fivesom',
    'https://www.tiktok.com/@fivesom',
    'https://www.youtube.com/@fivesom-net',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'noreply@fivesom.net',
      availableLanguage: ['en', 'so', 'ar'],
      url: `${SITE_URL}/support`,
    },
  ],
};

export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'FIVESOM',
  url: `${SITE_URL}/`,
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#organization` },
  description:
    'Hire verified freelancers or sell your services on FIVESOM — escrow-protected orders, verified sellers and local payouts.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'FIVESOM freelance marketplace',
  serviceType: 'Online freelance services marketplace',
  provider: { '@id': `${SITE_URL}/#organization` },
  areaServed: ['Worldwide', 'Africa', 'Somalia'],
  url: `${SITE_URL}/explore`,
  description:
    'Buyers order gigs from verified freelancers and pay into escrow; freelancers deliver work and get paid after the buyer accepts the delivery.',
};

export const breadcrumbSchema = (
  trail: { name: string; path: string }[],
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    item: `${SITE_URL}${t.path}`,
  })),
});
