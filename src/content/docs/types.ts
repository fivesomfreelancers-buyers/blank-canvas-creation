import type { DocsGroupId } from './chapters';

export interface DocsSectionText {
  heading: string;
  body?: string;
  bullets?: string[];
}

export interface DocsChapterText {
  title: string;
  eyebrow: string;
  summary: string;
  ctaLabel?: string;
  videoLabel?: string;
  sections: DocsSectionText[];
  /** Optional SEO override; falls back to title + summary. */
  metaTitle?: string;
  metaDescription?: string;
}

export interface DocsDictionary {
  dir: 'ltr' | 'rtl';
  ui: {
    docsLabel: string;
    home: string;
    h1: string;
    intro: string;
    metaTitle: string;
    metaDescription: string;
    searchPlaceholder: string;
    clearSearch: string;
    browseHeading: string;
    browseIntro: string;
    noResults: string;
    noResultsHint: string;
    chaptersLabel: string;
    relatedLabel: string;
    nextChapter: string;
    previousChapter: string;
    backToDocs: string;
    languageLabel: string;
    videoCaption: string;
    openMenu: string;
    closeMenu: string;
    needHelpTitle: string;
    needHelpBody: string;
    needHelpCta: string;
  };
  groups: Record<DocsGroupId, { title: string; description: string }>;
  chapters: Record<string, DocsChapterText>;
}
