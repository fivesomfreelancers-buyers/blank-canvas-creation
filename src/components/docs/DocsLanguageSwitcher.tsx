import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import {
  DOCS_LANGS,
  DOCS_LANG_LABELS,
  docsPath,
  type DocsDictionary,
  type DocsLang,
} from '@/content/docs';
import { Button } from '@/components/ui/button';

export const DOCS_LANG_STORAGE_KEY = 'fivesom.docs.lang';

interface Props {
  lang: DocsLang;
  dict: DocsDictionary;
  slug?: string;
}

const DocsLanguageSwitcher = ({ lang, dict, slug }: Props) => {
  const navigate = useNavigate();

  const change = (value: string) => {
    const next = value as DocsLang;
    try {
      localStorage.setItem(DOCS_LANG_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    navigate(docsPath(next, slug));
  };

  return (
    <div className="flex max-w-full items-center gap-2" aria-label={dict.ui.languageLabel}>
      <Globe className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden />
      <div className="flex max-w-full gap-1 overflow-x-auto rounded-md border border-border bg-background p-1" role="group">
        {DOCS_LANGS.map((code) => (
          <Button
            key={code}
            type="button"
            size="sm"
            variant={lang === code ? 'default' : 'ghost'}
            className="h-8 shrink-0 px-3"
            aria-pressed={lang === code}
            onClick={() => change(code)}
          >
            {DOCS_LANG_LABELS[code]}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DocsLanguageSwitcher;
