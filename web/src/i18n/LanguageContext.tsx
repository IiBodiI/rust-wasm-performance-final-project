import { createContext, useContext, useMemo, useState } from "react";
import type { Locale } from "../types";
import { translations } from "./translations";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("rust-wasm-lab-locale");
    return saved === "tr" || saved === "en" ? saved : "en";
  });

  const value = useMemo<LanguageContextValue>(() => {
    const setLocale = (next: Locale) => {
      localStorage.setItem("rust-wasm-lab-locale", next);
      setLocaleState(next);
    };

    return {
      locale,
      setLocale,
      t: (key: string) => translations[locale][key] ?? translations.en[key] ?? key
    };
  }, [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useI18n must be used inside LanguageProvider");
  return context;
}

