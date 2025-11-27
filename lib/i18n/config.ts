/**
 * Internationalization Configuration
 * 
 * Supports multiple languages with easy extensibility.
 */

export const locales = ['en', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
};

// Language configuration for HTML lang attribute
export const localeConfig: Record<Locale, { name: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
  de: { name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
};

