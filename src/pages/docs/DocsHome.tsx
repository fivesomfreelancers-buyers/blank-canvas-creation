import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LifeBuoy, Search } from 'lucide-react';
import SEO from '@/components/SEO';
import DocsShell from '@/components/docs/DocsShell';
import DocsHreflang from '@/components/docs/DocsHreflang';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { breadcrumbSchema } from '@/lib/seo/schemas';
import {
  DOCS_GROUP_ORDER,
  docsChaptersByGroup,
  docsDict,
  docsPath,
  type DocsLang,
} from '@/content/docs';

const DocsHome = ({ lang }: { lang: DocsLang }) => {
  const dict = docsDict(lang);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const groups = useMemo(
    () =>
      DOCS_GROUP_ORDER.map((group) => ({
        group,
        chapters: docsChaptersByGroup(group).filter((chapter) => {
          const text = dict.chapters[chapter.id];
          if (!text) return false;
          if (!q) return true;
          return `${text.title} ${text.summary} ${text.eyebrow}`.toLowerCase().includes(q);
        }),
      })).filter((g) => g.chapters.length > 0),
    [dict, q],
  );

  const canonical = docsPath(lang);

  return (
    <>
      <SEO
        title={dict.ui.metaTitle}
        description={dict.ui.metaDescription}
        canonical={canonical}
        jsonLd={breadcrumbSchema([
          { name: dict.ui.home, path: '/' },
          { name: dict.ui.docsLabel, path: canonical },
        ])}
      />
      <DocsHreflang lang={lang} />

      <DocsShell lang={lang} dict={dict}>
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
            {dict.ui.docsLabel}
          </p>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{dict.ui.h1}</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">{dict.ui.intro}</p>

          <div className="relative mt-6 max-w-md">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.ui.searchPlaceholder}
              aria-label={dict.ui.searchPlaceholder}
              className="ps-9"
            />
          </div>
        </header>

        <section aria-labelledby="browse-heading">
          <h2 id="browse-heading" className="text-xl font-semibold text-foreground">
            {dict.ui.browseHeading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{dict.ui.browseIntro}</p>

          {groups.length === 0 ? (
            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <p className="font-medium text-foreground">{dict.ui.noResults}</p>
              <p className="mt-1 text-sm text-muted-foreground">{dict.ui.noResultsHint}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setQuery('')}>
                {dict.ui.clearSearch}
              </Button>
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {groups.map(({ group, chapters }) => (
                <div key={group}>
                  <h3 className="text-base font-semibold text-foreground">{dict.groups[group].title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{dict.groups[group].description}</p>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                    {chapters.map((chapter) => {
                      const text = dict.chapters[chapter.id];
                      return (
                        <li key={chapter.id}>
                          <Link
                            to={docsPath(lang, chapter.id)}
                            className="group flex h-full gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/50"
                          >
                            <span className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                              <chapter.icon className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="min-w-0">
                              <span className="flex items-center gap-1 font-medium text-foreground">
                                {text.title}
                                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 rtl:rotate-180" aria-hidden />
                              </span>
                              <span className="mt-1 block text-sm text-muted-foreground">{text.summary}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <LifeBuoy className="h-5 w-5 text-primary" aria-hidden />
            {dict.ui.needHelpTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{dict.ui.needHelpBody}</p>
          <Button asChild className="mt-4">
            <Link to="/support">{dict.ui.needHelpCta}</Link>
          </Button>
        </section>
      </DocsShell>
    </>
  );
};

export default DocsHome;
