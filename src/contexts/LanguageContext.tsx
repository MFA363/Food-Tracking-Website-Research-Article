import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Language } from "@/lib/types";
import { getTranslation, type TFunction, LANGUAGES } from "@/lib/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TFunction;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem("nutrisiji_lang");
      return LANGUAGES.some((language) => language.code === stored) ? stored as Language : "id";
    } catch { return "id"; }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try { localStorage.setItem("nutrisiji_lang", newLang); } catch { /* Language still works for this page session. */ }
  };

  const isRTL = LANGUAGES.find((l) => l.code === lang)?.rtl ?? false;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [lang, isRTL]);

  const t = getTranslation(lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
