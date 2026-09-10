import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO, { SITE_URL } from '@/components/SEO';
import GigCard from '@/components/gig/GigCard';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CATEGORIES, getCategoryBySlug } from '@/lib/categories';
import { getCategoryContent } from '@/lib/seo/categoryContent';
import { breadcrumbSchema } from '@/lib/seo/schemas';
import { useGigSearch } from '@/hooks/useGigSearch';
import { gigPath } from '@/lib/urls';

const PAGE_SIZE = 24;

/**
 * Dedicated, indexable landing page for one category (/services/{category})
 * or one service type (/services/{category}/{subcategory}).
 * Every page links out to the real gig pages so Google can crawl them.
 */
const ServiceCategory: React.FC = () => {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug?: string }>();
  const [searchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') || 1));

  const category = getCategoryBySlug(categorySlug);
  const subcategory = category?.subcategories.find((s) => s.slug === subcategorySlug);
  const content = getCategoryContent(categorySlug);

  const unknown = !category || (subcategorySlug && !subcategory);

  const { gigs, total, loading } = useGigSearch({
    category: unknown ? 'none' : category!.slug,
    subcategory: subcategory?.slug ?? null,
    page,
    pageSize: PAGE_SIZE,
  });

  if (unknown) {
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title="Service not found | FIVESOM"
          description="This service page does not exist. Browse all freelance services on FIVESOM."
          canonical="/services"
          noindex
        />
        <Navbar />
        <div className="pt-28 pb-20 px-4 text-center max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-3">Service not found</h1>
          <p className="text-muted-foreground mb-6">
            We could not find that service. Browse every category instead.
          </p>
          <Button asChild>
            <Link to="/services">See all services</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const name = subcategory ? `${subcategory.name}` : category.name;
  const path = subcategory ? `/services/${category.slug}/${subcategory.slug}` : `/services/${category.slug}`;
  const url = `${SITE_URL}${path}`;

  const title = subcategory
    ? `${subcategory.name} Services — Hire ${category.name} Freelancers | FIVESOM`
    : `${category.name} Services — ${content?.headline ?? `Hire ${category.name} freelancers`} | FIVESOM`;

  const description = subcategory
    ? `Hire freelancers for ${subcategory.name.toLowerCase()} on FIVESOM. Compare packages, prices, delivery times and real reviews, and pay safely through escrow.`
    : content?.summary ??
      `Hire verified ${category.name.toLowerCase()} freelancers on FIVESOM. Compare packages, prices and reviews, and pay safely through escrow.`;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasGigs = total > 0;

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: category.name, path: `/services/${category.slug}` },
    ...(subcategory ? [{ name: subcategory.name, path }] : []),
  ];

  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${url}#collectionpage`,
      url,
      name: `${name} services on FIVESOM`,
      description,
      inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
      about: {
        '@type': 'Service',
        name: `${name} services`,
        serviceType: name,
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: ['Worldwide', 'Africa', 'Somalia'],
      },
    },
    breadcrumbSchema(trail),
  ];

  if (hasGigs && gigs.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${url}#gigs`,
      name: `${name} gigs on FIVESOM`,
      numberOfItems: gigs.length,
      itemListElement: gigs.map((gig, i) => ({
        '@type': 'ListItem',
        position: (page - 1) * PAGE_SIZE + i + 1,
        url: `${SITE_URL}${gigPath(gig)}`,
        name: gig.title,
      })),
    });
  }

  if (content?.faqs?.length && !subcategory) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: content.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={title}
        description={description}
        canonical={path}
        jsonLd={jsonLd}
        /* Keep empty service pages out of the index until real gigs exist. */
        noindex={!loading && !hasGigs}
      />
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              {trail.map((t, i) => (
                <li key={t.path} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5" aria-hidden />}
                  {i === trail.length - 1 ? (
                    <span className="text-foreground font-medium">{t.name}</span>
                  ) : (
                    <Link to={t.path} className="hover:text-primary transition-colors">
                      {t.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Hero */}
          <header className="max-w-3xl mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {subcategory
                ? `${subcategory.name} services`
                : `${category.name} services — ${content?.headline ?? `hire ${category.name.toLowerCase()} freelancers`}`}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              {subcategory
                ? `Order ${subcategory.name.toLowerCase()} from freelance ${category.name.toLowerCase()} specialists on FIVESOM. Compare packages, delivery times and reviews, then pay into escrow — the freelancer is paid only after you accept the work.`
                : content?.intro?.[0]}
            </p>
            {!subcategory && content?.intro?.[1] && (
              <p className="text-base text-muted-foreground mt-4">{content.intro[1]}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-6">
              <Button asChild>
                <Link to={`/explore?category=${category.slug}${subcategory ? `&subcategory=${subcategory.slug}` : ''}`}>
                  Browse all {name.toLowerCase()} gigs
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/how-it-works">How ordering works</Link>
              </Button>
            </div>
          </header>

          {/* Gig grid — real internal links to every gig page */}
          <section aria-labelledby="gigs-heading" className="mb-14">
            <h2 id="gigs-heading" className="text-xl sm:text-2xl font-bold text-foreground mb-1">
              {name} gigs available now
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {loading ? 'Loading gigs…' : `${total} gig${total === 1 ? '' : 's'} in ${name}`}
            </p>

            {loading ? (
              <div className="py-16 text-center text-muted-foreground">Loading gigs…</div>
            ) : gigs.length === 0 ? (
              <div className="py-12 rounded-2xl border border-border bg-card/50 text-center">
                <p className="text-foreground font-medium mb-2">No {name.toLowerCase()} gigs published yet</p>
                <p className="text-sm text-muted-foreground mb-5">
                  New gigs appear here as soon as freelancers publish them.
                </p>
                <Button asChild variant="outline">
                  <Link to="/explore">Explore other services</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {gigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                {page > 1 && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`${path}${page - 1 > 1 ? `?page=${page - 1}` : ''}`} rel="prev">
                      Previous
                    </Link>
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`${path}?page=${page + 1}`} rel="next">
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* What you can order */}
          {!subcategory && content?.deliverables?.length && (
            <section aria-labelledby="deliverables-heading" className="mb-14">
              <h2 id="deliverables-heading" className="text-xl sm:text-2xl font-bold text-foreground mb-5">
                What you can order in {category.name}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {content.deliverables.map((d) => (
                  <li key={d} className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Service types inside this category — internal links */}
          <section aria-labelledby="types-heading" className="mb-14">
            <h2 id="types-heading" className="text-xl sm:text-2xl font-bold text-foreground mb-5">
              {subcategory ? `More ${category.name} services` : `${category.name} service types`}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {category.subcategories
                .filter((s) => s.slug !== subcategory?.slug)
                .map((s) => (
                  <li key={s.slug}>
                    <Link
                      to={`/services/${category.slug}/${s.slug}`}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm bg-muted/70 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {s.name}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </Link>
                  </li>
                ))}
            </ul>
          </section>

          {/* FAQ */}
          {!subcategory && content?.faqs?.length && (
            <section aria-labelledby="faq-heading" className="mb-14 max-w-3xl">
              <h2 id="faq-heading" className="text-xl sm:text-2xl font-bold text-foreground mb-5">
                {category.name} — frequently asked questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {content.faqs.map((f, i) => (
                  <AccordionItem key={f.q} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}

          {/* Other categories — sitewide internal linking */}
          <section aria-labelledby="other-heading">
            <h2 id="other-heading" className="text-xl sm:text-2xl font-bold text-foreground mb-5">
              Other services on FIVESOM
            </h2>
            <ul className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/services/${c.slug}`}
                    className="inline-flex px-4 py-2 rounded-full text-sm bg-muted/70 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceCategory;
