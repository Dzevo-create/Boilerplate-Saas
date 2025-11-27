/**
 * Internationalization System
 * 
 * Exports all i18n utilities and components.
 */

export { locales, defaultLocale, localeNames, localeFlags, localeConfig, type Locale } from './config';
export { I18nProvider, useI18n, useTranslations } from './I18nProvider';
export { en, de, type Translations } from './translations';

