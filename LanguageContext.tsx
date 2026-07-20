import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { LanguageCode } from '../lib/languages';
import { t as translate, type TranslationKey } from '../lib/translations';

interface LanguageContextValue {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('narad-lang');
    return (saved as LanguageCode) || 'en';
  });

  const setLang = (l: LanguageCode) => {
    setLangState(l);
    localStorage.setItem('narad-lang', l);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: TranslationKey) => translate(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
