import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export const SITE_URL = 'https://fivesom.net';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/** Turns "/explore" or a full URL into an absolute, self-referencing URL. */
export const absoluteSeoUrl = (path: string): string => {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  type?: string;
  jsonLd?: object | object[];
  image?: string;
  /** Keep private / thin pages out of search results. */
  noindex?: boolean;
}

const SEO = ({
  title,
  description,
  canonical,
  type = 'website',
  jsonLd,
  image,
  noindex = false,
}: SEOProps) => {
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const url = absoluteSeoUrl(canonical);
  const ogImage = image ? absoluteSeoUrl(image) : DEFAULT_OG_IMAGE;

  // index.html carries a site-wide share image for crawlers that do not run
  // JavaScript. When a page supplies its own image (a gig photo, for example),
  // those static tags are dropped so crawlers see exactly one share image.
  // index.html carries a site-wide robots directive for crawlers that do not run
  // JavaScript. Once a route sets its own, the static one is removed so a
  // noindex page can never be contradicted by the site-wide "index, follow".
  // Gig and freelancer pages are also given a canonical link at serve time by
  // the Netlify edge function, so the non-Helmet copy is dropped to keep exactly
  // one canonical per page.
  useEffect(() => {
    document
      .querySelectorAll('meta[name="robots"]:not([data-rh])')
      .forEach((el) => el.remove());
    document
      .querySelectorAll('link[rel="canonical"]:not([data-rh])')
      .forEach((el) => el.remove());
  }, []);

  useEffect(() => {
    if (!image) return;
    document
      .querySelectorAll(
        'meta[property="og:image"]:not([data-rh]), meta[property="og:image:width"]:not([data-rh]), meta[property="og:image:height"]:not([data-rh]), meta[property="og:image:alt"]:not([data-rh]), meta[name="twitter:image"]:not([data-rh])',
      )
      .forEach((el) => el.remove());
  }, [image]);


  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      )}
      <meta property="og:site_name" content="FIVESOM" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
