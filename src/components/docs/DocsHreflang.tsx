import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '@/components/SEO';
import { DOCS_LANGS, docsPath, docsDict, type DocsLang } from '@/content/docs';

/**
 * Language alternates for a documentation URL. English is the x-default.
 */
const DocsHreflang = ({ lang, slug }: { lang: DocsLang; slug?: string }) => (
  <Helmet>
    <html lang={lang} dir={docsDict(lang).dir} />
    {DOCS_LANGS.map((code) => (
      <link key={code} rel="alternate" hrefLang={code} href={`${SITE_URL}${docsPath(code, slug)}`} />
    ))}
    <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${docsPath('en', slug)}`} />
  </Helmet>
);

export default DocsHreflang;
