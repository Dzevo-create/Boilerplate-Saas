'use client';

/**
 * Global Providers
 * 
 * Wraps all client-side providers for the application.
 * - ThemeProvider: Dark/Light mode support
 * - I18nProvider: Internationalization (DE/EN)
 */

import { ThemeProvider } from '@/components/theme';
import { I18nProvider } from '@/lib/i18n';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <I18nProvider>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}

