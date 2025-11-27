/**
 * Root Layout
 * 
 * The main layout wrapper for the entire application.
 * Includes all global providers: Auth, Theme, i18n
 */

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { DemoBanner } from '@/components/common/DemoBanner';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'SaaS Boilerplate',
    template: '%s | SaaS Boilerplate',
  },
  description: 'Production-ready SaaS boilerplate with Next.js, Supabase, and Stripe',
  keywords: ['SaaS', 'Next.js', 'Supabase', 'Stripe', 'Boilerplate'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <AuthProvider>
            <DemoBanner />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                },
              }}
            />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
