import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import {
  DOCS_LANGS,
  DOCS_LANG_LABELS,
  docsPath,
  type DocsDictionary,
  type DocsLang,
} from '@/content/docs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" aria-hidden />
      <label className="sr-only" htmlFor="docs-language">
        {dict.ui.languageLabel}
      </label>
      <Select value={lang} onValueChange={change}>
        <SelectTrigger id="docs-language" className="h-9 w-[150px]">
          <SelectValue placeholder={dict.ui.languageLabel} />
        </SelectTrigger>
        <SelectContent>
          {DOCS_LANGS.map((code) => (
            <SelectItem key={code} value={code}>
              {DOCS_LANG_LABELS[code]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DocsLanguageSwitcher;
