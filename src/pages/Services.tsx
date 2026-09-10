import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO, { SITE_URL } from '@/components/SEO';
import { CATEGORIES } from '@/lib/categories';
import { getCategoryContent } from '@/lib/seo/categoryContent';
import { breadcrumbSchema } from '@/lib/seo/schemas';

/** Hub page linking to every category and service-type landing page. */
const Services: React.FC = () => {
  const url = `${SITE_URL}/services`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${url}#collectionpage`,
      url,
      name: 'All freelance services on FIVESOM',
      description:
        'Every service category on FIVESOM — logo design, video editing, motion graphics, web design and development, app development, writing, UI/UX and graphic design.',
      inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
      hasPart: CATEGORIES.map((c) => ({
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/services/${c.slug}#collectionpage`,
        url: `${SITE_URL}/services/${c.slug}`,
        name: `${c.name} services`,
      })),
    },
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ]),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="All Freelance Services — Design, Video, Web & Writing | FIVESOM"
        description="Browse every freelance service on FIVESOM: logo design, video editing, motion graphics, web design and development, app development, UI/UX, graphic design and content writing."
        canonical="/services"
        jsonLd={jsonLd}
      />
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="max-w-3xl mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              All freelance services on FIVESOM
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Pick a category to see the freelancers, packages and prices available today. Every order is
              protected by escrow — the freelancer is paid only after you accept the delivered work.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            {CATEGORIES.map((c) => {
              const content = getCategoryContent(c.slug);
              return (
                <section key={c.slug} className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    <Link to={`/services/${c.slug}`} className="hover:text-primary transition-colors">
                      {c.name} services
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">{content?.summary}</p>
                  <ul className="flex flex-wrap gap-2 mb-4">
                    {c.subcategories.map((s) => (
                      <li key={s.slug}>
                        <Link
                          to={`/services/${c.slug}/${s.slug}`}
                          className="inline-flex px-3 py-1.5 rounded-full text-xs bg-muted/70 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/services/${c.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                  >
                    See all {c.name.toLowerCase()} gigs
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </section>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
