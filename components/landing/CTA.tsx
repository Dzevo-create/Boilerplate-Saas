'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface CTAProps {
  variant?: 'default' | 'gradient' | 'dark';
  className?: string;
}

export function CTA({ variant = 'default', className }: CTAProps) {
  const { t } = useI18n();

  const variants = {
    default: 'bg-secondary/50',
    gradient: 'bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/50',
    dark: 'bg-foreground text-background',
  };

  return (
    <section className={cn('border-t border-border py-24', variants[variant], className)}>
      <div className="container mx-auto px-4 text-center">
        {/* Title */}
        <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{t('landing.cta.title')}</h2>

        {/* Subtitle */}
        <p className={cn(
          'mx-auto mb-8 max-w-xl text-lg',
          variant === 'dark' ? 'text-background/70' : 'text-muted-foreground'
        )}>
          {t('landing.cta.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button
              size="lg"
              className="gap-2"
              variant={variant === 'dark' ? 'secondary' : 'default'}
            >
              {t('landing.cta.primaryCta')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button
              size="lg"
              variant="outline"
            >
              {t('landing.cta.secondaryCta')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

