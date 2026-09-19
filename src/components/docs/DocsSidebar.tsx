import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DOCS_GROUP_ORDER,
  docsChaptersByGroup,
  docsPath,
  type DocsDictionary,
  type DocsLang,
} from '@/content/docs';

interface Props {
  lang: DocsLang;
  dict: DocsDictionary;
  activeId?: string;
  onNavigate?: () => void;
}

const DocsSidebar = ({ lang, dict, activeId, onNavigate }: Props) => (
  <nav aria-label={dict.ui.chaptersLabel} className="space-y-6">
    <Link
      to={docsPath(lang)}
      onClick={onNavigate}
      className={cn(
        'block rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
        !activeId && 'bg-muted text-foreground',
      )}
    >
      {dict.ui.backToDocs}
    </Link>

    {DOCS_GROUP_ORDER.map((group) => (
      <div key={group}>
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {dict.groups[group].title}
        </p>
        <ul className="space-y-1">
          {docsChaptersByGroup(group).map((chapter) => {
            const text = dict.chapters[chapter.id];
            if (!text) return null;
            const active = chapter.id === activeId;
            return (
              <li key={chapter.id}>
                <Link
                  to={docsPath(lang, chapter.id)}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-start gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <chapter.icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{text.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    ))}
  </nav>
);

export default DocsSidebar;
