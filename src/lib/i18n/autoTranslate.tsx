import { useEffect } from 'react';
import { LangCode, useLanguage } from './LanguageContext';
import { translatePhrase } from './dictionary';

/**
 * Site-wide text translation.
 *
 * Every rendered text node (and common text-bearing attributes) is looked up in
 * the phrase dictionary and swapped for the active language. Original English
 * text is remembered so switching back is lossless, and a MutationObserver keeps
 * newly rendered content translated as the user navigates.
 */

const ORIGINAL = new WeakMap<Node, string>();
const APPLIED = new WeakMap<Node, string>();
const ORIGINAL_ATTR = new WeakMap<Element, Record<string, string>>();
const ATTRS = ['placeholder', 'title', 'aria-label', 'value'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE']);

function translateTextNode(node: Text, lang: LangCode) {
  const current = node.nodeValue ?? '';
  if (!current.trim()) return;

  // If React (or any code) wrote a new value into this node, that value becomes
  // the new source text — never resurrect a stale original.
  const stored = ORIGINAL.get(node);
  const applied = APPLIED.get(node);
  const original = stored !== undefined && current === applied ? stored : current;
  ORIGINAL.set(node, original);

  const translated = translatePhrase(original, lang);
  const next = translated ? original.replace(original.trim(), translated) : original;
  APPLIED.set(node, next);
  if (node.nodeValue !== next) node.nodeValue = next;
}


function translateAttrs(el: Element, lang: LangCode) {
  if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && !el.hasAttribute('title') && !el.hasAttribute('aria-label')) return;
  let store = ORIGINAL_ATTR.get(el);
  if (!store) {
    store = {};
    for (const attr of ATTRS) {
      const v = el.getAttribute(attr);
      if (v) store[attr] = v;
    }
    ORIGINAL_ATTR.set(el, store);
  }
  for (const [attr, original] of Object.entries(store)) {
    if (attr === 'value' && el.tagName !== 'BUTTON') continue;
    const translated = translatePhrase(original, lang) ?? original;
    if (el.getAttribute(attr) !== translated) el.setAttribute(attr, translated);
  }
}

function walk(root: Node, lang: LangCode) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text, lang);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (SKIP_TAGS.has(el.tagName)) return;

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) =>
      n.nodeType === Node.ELEMENT_NODE && SKIP_TAGS.has((n as Element).tagName)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });

  translateAttrs(el, lang);
  let current: Node | null = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) translateTextNode(current as Text, lang);
    else translateAttrs(current as Element, lang);
    current = walker.nextNode();
  }
}

export function useAutoTranslate() {
  const { lang } = useLanguage();

  useEffect(() => {
    const root = document.body;
    if (!root) return;

    let scheduled = false;
    const pending: Node[] = [];

    const flush = () => {
      scheduled = false;
      const nodes = pending.splice(0, pending.length);
      observer.disconnect();
      for (const node of nodes) {
        if (node.isConnected) walk(node, lang);
      }
      observer.observe(root, { childList: true, subtree: true, characterData: true });
    };

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'characterData') pending.push(m.target);
        else m.addedNodes.forEach((n) => pending.push(n));
      }
      if (pending.length && !scheduled) {
        scheduled = true;
        requestAnimationFrame(flush);
      }
    });

    walk(root, lang);
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [lang]);
}

export const AutoTranslate: React.FC = () => {
  useAutoTranslate();
  return null;
};
