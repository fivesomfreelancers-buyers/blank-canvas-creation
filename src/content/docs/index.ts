import { DOCS_CHAPTERS, DOCS_GROUP_ORDER, type DocsGroupId, type DocsLang } from './chapters';
import type { DocsDictionary } from './types';
import en from './en';
import so from './so';
import ar from './ar';
import fr from './fr';

export const DOCS_DICTS: Record<DocsLang, DocsDictionary> = { en, so, ar, fr };

export const docsDict = (lang: DocsLang): DocsDictionary => DOCS_DICTS[lang] ?? en;

/** Chapter ids in reading order (group order, then declaration order). */
export const DOCS_ORDER: string[] = DOCS_GROUP_ORDER.flatMap((group) =>
  DOCS_CHAPTERS.filter((c) => c.group === group).map((c) => c.id),
);

export const docsChaptersByGroup = (group: DocsGroupId) =>
  DOCS_CHAPTERS.filter((c) => c.group === group);

export const docsNeighbours = (id: string) => {
  const i = DOCS_ORDER.indexOf(id);
  return {
    previous: i > 0 ? DOCS_ORDER[i - 1] : undefined,
    next: i >= 0 && i < DOCS_ORDER.length - 1 ? DOCS_ORDER[i + 1] : undefined,
  };
};

export * from './chapters';
export type { DocsDictionary, DocsChapterText, DocsSectionText } from './types';
