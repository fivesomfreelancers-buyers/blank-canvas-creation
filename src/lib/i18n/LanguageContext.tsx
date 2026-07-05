import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type LangCode = 'en' | 'so' | 'fr' | 'ar';

export const LANGUAGES: { code: LangCode; label: string; flag: string; native: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'so', label: 'Somali', flag: '🇸🇴', native: 'Soomaali' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', native: 'العربية' },
];

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
    return stored && ['en', 'so', 'fr', 'ar'].includes(stored) ? stored : 'en';
  });

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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

export function t<T>(dict: Record<LangCode, T>, lang: LangCode): T {
  return dict[lang] ?? dict.en;
}
