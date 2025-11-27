'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme';
import { LanguageSwitcher } from '@/components/i18n';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface HeaderProps {
  logo?: React.ReactNode;
  showThemeToggle?: boolean;
  showLanguageSwitcher?: boolean;
  className?: string;
}

export function Header({ 
  logo, 
  showThemeToggle = true,
  showLanguageSwitcher = true,
  className 
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  const navItems = [
    { label: t('nav.features'), href: '#features' },
    { label: t('nav.pricing'), href: '/pricing' },
    { label: t('nav.about'), href: '#about' },
  ];

  return (
    <header className={cn(
      'sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl',
      className
    )}>
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          {logo || (
            <>
              <span className="text-primary">SaaS</span>Boilerplate
            </>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA & Controls */}
        <div className="hidden items-center gap-2 md:flex">
          {showLanguageSwitcher && (
            <LanguageSwitcher variant="icon" />
          )}
          {showThemeToggle && (
            <ThemeToggle variant="icon" />
          )}
          <Link href="/login">
            <Button variant="ghost" size="sm">{t('nav.login')}</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">{t('nav.register')}</Button>
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          {showThemeToggle && (
            <ThemeToggle variant="icon" />
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {showLanguageSwitcher && (
              <div className="py-2">
                <LanguageSwitcher variant="buttons" />
              </div>
            )}
            
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Link href="/login">
                <Button variant="outline" className="w-full">{t('nav.login')}</Button>
              </Link>
              <Link href="/register">
                <Button className="w-full">{t('nav.register')}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
