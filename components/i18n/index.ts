/**
 * Internationalization Components
 * 
 * Multi-language support with easy extensibility.
 * 
 * Usage:
 * ```tsx
 * // In layout.tsx
 * import { I18nProvider } from '@/lib/i18n/I18nProvider';
 * 
 * <I18nProvider>
 *   {children}
 * </I18nProvider>
 * 
 * // In any component
 * import { LanguageSwitcher } from '@/components/i18n';
 * import { useI18n, useTranslations } from '@/lib/i18n/I18nProvider';
 * 
 * const t = useTranslations();
 * <p>{t('landing.title')}</p>
 * <LanguageSwitcher variant="dropdown" />
 * ```
 */

export { LanguageSwitcher } from './LanguageSwitcher';

