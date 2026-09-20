import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import DocsSidebar from './DocsSidebar';
import DocsLanguageSwitcher from './DocsLanguageSwitcher';
import { docsPath, type DocsDictionary, type DocsLang } from '@/content/docs';

interface Props {
  lang: DocsLang;
  dict: DocsDictionary;
  activeId?: string;
  /** Current chapter title, used in the breadcrumb trail. */
  activeTitle?: string;
  children: ReactNode;
}

const DocsShell = ({ lang, dict, activeId, activeTitle, children }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pt-16" dir={dict.dir}>
      <Navbar />

      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">{dict.ui.home}</Link>
            <ChevronRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
            <Link to={docsPath(lang)} className="hover:text-foreground">{dict.ui.docsLabel}</Link>
            {activeTitle && (
              <>
                <ChevronRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
                <span className="text-foreground">{activeTitle}</span>
              </>
            )}
          </nav>
          <DocsLanguageSwitcher lang={lang} dict={dict} slug={activeId} />
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:py-12">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pe-2">
            <DocsSidebar lang={lang} dict={dict} activeId={activeId} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 lg:hidden">
            <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
              {open ? <X className="me-2 h-4 w-4" /> : <Menu className="me-2 h-4 w-4" />}
              {open ? dict.ui.closeMenu : dict.ui.openMenu}
            </Button>
            {open && (
              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <DocsSidebar lang={lang} dict={dict} activeId={activeId} onNavigate={() => setOpen(false)} />
              </div>
            )}
          </div>

          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DocsShell;
