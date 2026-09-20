import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import NotFound from '@/pages/NotFound';
import SEO, { SITE_URL } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/categories';
import { breadcrumbSchema } from '@/lib/seo/schemas';
import { MARKETS, getMarket } from '@/content/markets';

/** Region / country landing page: /freelancers/:market */
const FreelancerMarket = () => {
  const { market: slug } = useParams<{ market: string }>();
  const market = getMarket(slug || '');

  if (!market) return <NotFound />;

  const canonical = `/freelancers/${market.slug}`;
  const url = `${SITE_URL}${canonical}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: market.h1,
      description: market.metaDescription,
      inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
      about: {
        '@type': 'Service',
        name: `FIVESOM freelance marketplace — ${market.name}`,
        serviceType: 'Online freelance services marketplace',
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: market.areaServed,
        availableLanguage: market.languages,
      },
    },
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Freelancers', path: '/freelancers/africa' },
      { name: market.name, path: canonical },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: market.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  const otherMarkets = MARKETS.filter((m) => m.slug !== market.slug);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={market.metaTitle}
        description={market.metaDescription}
        canonical={canonical}
        jsonLd={jsonLd}
      />
      <Navbar />

      <main className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">Home</Link></li>
              <li aria-hidden>/</li>
              <li><Link to="/freelancers/africa" className="hover:text-foreground">Freelancers</Link></li>
              <li aria-hidden>/</li>
              <li className="text-foreground">{market.name}</li>
            </ol>
          </nav>

          <header className="mb-10">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{market.h1}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{market.intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/register">Join FIVESOM free</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/explore">Browse freelancers and gigs</Link>
              </Button>
            </div>
          </header>

          <div className="space-y-10">
            {market.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{section.heading}</h2>
                {section.body && <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>}
                {section.bullets && (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <section className="mt-12">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Popular service categories</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/services/${c.slug}`}
                    className="inline-flex rounded-full bg-muted/70 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Frequently asked questions</h2>
            <dl className="mt-4 space-y-5">
              {market.faqs.map((f) => (
                <div key={f.q} className="rounded-xl border border-border bg-card p-5">
                  <dt className="font-medium text-foreground">{f.q}</dt>
                  <dd className="mt-2 text-sm text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Other FIVESOM markets</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {otherMarkets.map((m) => (
                <li key={m.slug}>
                  <Link
                    to={`/freelancers/${m.slug}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:border-primary/40 hover:bg-muted/50"
                  >
                    <span className="font-medium text-foreground">{m.name}</span>
                    <ArrowRight className="h-4 w-4 text-primary" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
            <h2 className="text-lg font-semibold text-foreground">New to FIVESOM?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Read <Link to="/how-it-works" className="text-primary underline">how FIVESOM works</Link>, or open the{' '}
              <Link to="/docs" className="text-primary underline">documentation</Link> for step-by-step guides on creating
              a gig, ordering safely and withdrawing your earnings.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerMarket;
