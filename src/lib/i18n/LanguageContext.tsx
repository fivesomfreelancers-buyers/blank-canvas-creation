import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type LangCode = 'en' | 'so' | 'fr' | 'am' | 'ar';

export const LANGUAGES: { code: LangCode; label: string; flag: string; native: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'so', label: 'Somali', flag: '🇸🇴', native: 'Soomaali' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'am', label: 'Amharic', flag: '🇪🇹', native: 'አማርኛ' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', native: 'العربية' },
];

const CODES: LangCode[] = ['en', 'so', 'fr', 'am', 'ar'];

const STORAGE_KEY = 'fivesom.lang';

interface Ctx {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<Ctx | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LangCode>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    return stored && CODES.includes(stored) ? stored : 'en';
  });

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export function t<T>(dict: Partial<Record<LangCode, T>> & { en: T }, lang: LangCode): T {
  return (dict[lang] ?? dict.en) as T;
}
