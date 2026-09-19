import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LifeBuoy, PlayCircle } from 'lucide-react';
import SEO from '@/components/SEO';
import DocsShell from '@/components/docs/DocsShell';
import DocsHreflang from '@/components/docs/DocsHreflang';
import { Button } from '@/components/ui/button';
import { breadcrumbSchema } from '@/lib/seo/schemas';
import { SITE_URL } from '@/components/SEO';
import {
  docsChapterMeta,
  docsDict,
  docsNeighbours,
  docsPath,
  type DocsLang,
} from '@/content/docs';

interface Props {
  lang: DocsLang;
  slug: string;
}

const DocsChapterPage = ({ lang, slug }: Props) => {
  const dict = docsDict(lang);
  const meta = docsChapterMeta(slug)!;
  const text = dict.chapters[slug];
  const { previous, next } = docsNeighbours(slug);
  const canonical = docsPath(lang, slug);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: text.title,
    description: text.summary,
    inLanguage: lang,
    url: `${SITE_URL}${canonical}`,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    articleSection: dict.groups[meta.group].title,
  };

  return (
    <>
      <SEO
        title={text.metaTitle || `${text.title} — ${dict.ui.docsLabel} | FIVESOM`}
        description={text.metaDescription || text.summary}
        canonical={canonical}
        type="article"
        jsonLd={[
          articleSchema,
          breadcrumbSchema([
            { name: dict.ui.home, path: '/' },
            { name: dict.ui.docsLabel, path: docsPath(lang) },
            { name: text.title, path: canonical },
          ]),
        ]}
      />
      <DocsHreflang lang={lang} slug={slug} />

      <DocsShell lang={lang} dict={dict} activeId={slug} activeTitle={text.title}>
        <article className="max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{text.eyebrow}</p>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{text.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{text.summary}</p>

          <div className="mt-8 space-y-8">
            {text.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
                {section.body && <p className="mt-2 leading-relaxed text-muted-foreground">{section.body}</p>}
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

          {meta.video && (
            <section className="mt-10">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <PlayCircle className="h-5 w-5 text-primary" aria-hidden />
                {text.videoLabel || text.title}
              </h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-black">
                <video
                  src={meta.video}
                  controls
                  preload="metadata"
                  playsInline
                  className="aspect-video w-full"
                  aria-label={text.videoLabel || text.title}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{dict.ui.videoCaption}</p>
            </section>
          )}

          {meta.cta && text.ctaLabel && (
            <div className="mt-10">
              <Button asChild>
                <Link to={meta.cta.to}>{text.ctaLabel}</Link>
              </Button>
            </div>
          )}

          {meta.related.length > 0 && (
            <section className="mt-12">
              <h2 className="text-lg font-semibold text-foreground">{dict.ui.relatedLabel}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {meta.related
                  .filter((id) => dict.chapters[id])
                  .map((id) => (
                    <li key={id}>
                      <Link
                        to={docsPath(lang, id)}
                        className="block rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:border-primary/40 hover:bg-muted/50"
                      >
                        <span className="font-medium text-foreground">{dict.chapters[id].title}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{dict.chapters[id].summary}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          <nav className="mt-12 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
            {previous ? (
              <Link to={docsPath(lang, previous)} className="group text-sm text-muted-foreground hover:text-foreground">
                <span className="flex items-center gap-1 text-xs uppercase tracking-wide">
                  <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                  {dict.ui.previousChapter}
                </span>
                <span className="mt-1 block font-medium text-foreground">{dict.chapters[previous]?.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={docsPath(lang, next)} className="group text-sm text-muted-foreground hover:text-foreground sm:text-end">
                <span className="flex items-center gap-1 text-xs uppercase tracking-wide sm:justify-end">
                  {dict.ui.nextChapter}
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                </span>
                <span className="mt-1 block font-medium text-foreground">{dict.chapters[next]?.title}</span>
              </Link>
            )}
          </nav>

          <section className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <LifeBuoy className="h-5 w-5 text-primary" aria-hidden />
              {dict.ui.needHelpTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{dict.ui.needHelpBody}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/support">{dict.ui.needHelpCta}</Link>
            </Button>
          </section>
        </article>
      </DocsShell>
    </>
  );
};

export default DocsChapterPage;
