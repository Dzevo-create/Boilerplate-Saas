'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { locales, defaultLocale, type Locale } from './config';
import { en, de, type Translations } from './translations';

// Translation dictionaries
const translations: Record<Locale, Translations> = { en, de };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
  storageKey?: string;
}

export function I18nProvider({
  children,
  initialLocale,
  storageKey = 'saas-locale',
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [mounted, setMounted] = useState(false);

  // Initialize locale from localStorage or browser
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Locale | null;
    if (stored && locales.includes(stored)) {
      setLocaleState(stored);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (locales.includes(browserLang)) {
        setLocaleState(browserLang);
      }
    }
    setMounted(true);
  }, [storageKey]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!locales.includes(newLocale)) return;
    setLocaleState(newLocale);
    localStorage.setItem(storageKey, newLocale);
    // Update HTML lang attribute
    document.documentElement.lang = newLocale;
  }, [storageKey]);

  // Translation function with nested key support and parameter interpolation
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Key not found, return the key itself
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return params[paramKey]?.toString() ?? `{${paramKey}}`;
      });
    }

    return value;
  }, [locale]);

  // Set HTML lang attribute on mount
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Convenience hook just for translations
export function useTranslations() {
  const { t } = useI18n();
  return t;
}

