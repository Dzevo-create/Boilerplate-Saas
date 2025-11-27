'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface LanguageSwitcherProps {
  variant?: 'icon' | 'dropdown' | 'buttons';
  showFlag?: boolean;
  showName?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = 'dropdown',
  showFlag = true,
  showName = true,
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'buttons') {
    return (
      <div className={cn('flex items-center gap-1 rounded-lg border border-border p-1', className)}>
        {locales.map((loc) => (
          <Button
            key={loc}
            variant={locale === loc ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setLocale(loc)}
            className="h-8 px-2"
          >
            {showFlag && <span className="mr-1">{localeFlags[loc]}</span>}
            {showName && <span className="text-xs uppercase">{loc}</span>}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className={cn('relative', className)} ref={dropdownRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Change language"
        >
          <Globe className="h-5 w-5" />
        </Button>

        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[150px] rounded-lg border border-border bg-popover p-1 shadow-lg">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary',
                  locale === loc && 'bg-secondary'
                )}
              >
                <span>{localeFlags[loc]}</span>
                <span>{localeNames[loc]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        {showFlag && <span>{localeFlags[locale]}</span>}
        {showName && <span>{localeNames[locale]}</span>}
        <svg
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[150px] rounded-lg border border-border bg-popover p-1 shadow-lg">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc);
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary',
                locale === loc && 'bg-secondary'
              )}
            >
              <span>{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

