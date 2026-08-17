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
