import React, { createContext, useContext, useEffect } from 'react';

// Multi-language switching was removed — the site is English only.
export type LangCode = 'en';

const STORAGE_KEY = 'fivesom.lang';

interface Ctx {
  lang: LangCode;
  dir: 'ltr';
}

const LanguageContext = createContext<Ctx | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Clear any language previously stored by the old switcher.
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  }, []);

  return (
    <LanguageContext.Provider value={{ lang: 'en', dir: 'ltr' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  return ctx ?? { lang: 'en' as LangCode, dir: 'ltr' as const };
};

export function t<T>(dict: Partial<Record<string, T>> & { en: T }, _lang?: LangCode): T {
  return dict.en;
}
